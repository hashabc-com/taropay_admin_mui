import type { GridRenderCellParams } from '@mui/x-data-grid';

import { useRef, useState, useCallback } from 'react';

import Popper from '@mui/material/Popper';
import { styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

/**
 * 检测 DOM 元素是否存在文本溢出（ellipsis）
 */
function isOverflown(element: Element): boolean {
  return element.scrollWidth > element.clientWidth;
}

// ----------------------------------------------------------------------

type CellAlign = 'left' | 'center' | 'right';
type CellOptions = { align?: CellAlign };
type CellGetter = (params: GridRenderCellParams) => unknown;

/**
 * 通用的 DataGrid 单元格渲染：文本溢出时显示省略号 + hover 显示完整内容的 Tooltip。
 *
 * **仅当文本确实被截断时才弹出 Tooltip**，短文本不会弹出多余气泡。
 * 鼠标可移入浮层复制内容，移出后自动关闭。
 *
 * ## 用法
 *
 * 1. **直接用于纯文本列**（默认居中）：
 * ```ts
 * { field: 'name', headerName: '名称', width: 120, renderCell: renderCellWithTooltip }
 * ```
 *
 * 2. **传入自定义取值函数**（默认居中）：
 * ```ts
 * {
 *   field: 'transId',
 *   renderCell: renderCellWithTooltip((params) =>
 *     params.row.transactionType === 'P' ? params.row.transId : params.row.transactionid
 *   ),
 * }
 * ```
 *
 * 3. **自定义取值 + 指定对齐方式**：
 * ```ts
 * { field: 'remark', renderCell: renderCellWithTooltip((p) => p.row.remark, { align: 'left' }) }
 * ```
 *
 * 4. **仅指定对齐方式**（无自定义取值）：
 * ```ts
 * { field: 'name', renderCell: renderCellWithTooltip({ align: 'left' }) }
 * ```
 */
// 重载：工厂模式 — 取值函数 + 可选配置
export function renderCellWithTooltip(
  getter: CellGetter,
  options?: CellOptions
): (params: GridRenderCellParams) => React.ReactElement;
// 重载：仅配置模式 — 传入选项对象，返回 renderCell 函数
export function renderCellWithTooltip(
  options: CellOptions
): (params: GridRenderCellParams) => React.ReactElement;
// 重载：直接模式 — 作为 renderCell 使用
export function renderCellWithTooltip(params: GridRenderCellParams): React.ReactElement;
// 实现
export function renderCellWithTooltip(
  first: GridRenderCellParams | CellGetter | CellOptions,
  second?: CellOptions
): React.ReactElement | ((params: GridRenderCellParams) => React.ReactElement) {
  // 工厂模式：取值函数 + 可选配置
  if (typeof first === 'function') {
    const align = second?.align ?? 'center';
    return (params: GridRenderCellParams) => {
      const raw = first(params);
      const text = raw == null || raw === '' ? '-' : String(raw);
      return <OverflowTooltipCell text={text} align={align} />;
    };
  }

  // 仅配置模式：普通对象且没有 GridRenderCellParams 特征
  if (isOptions(first)) {
    const align = first.align ?? 'center';
    return (params: GridRenderCellParams) => {
      const value = params.formattedValue ?? params.value;
      const text = value == null || value === '' ? '-' : String(value);
      return <OverflowTooltipCell text={text} align={align} />;
    };
  }

  // 直接模式
  const value = first.formattedValue ?? first.value;
  const text = value == null || value === '' ? '-' : String(value);
  return <OverflowTooltipCell text={text} />;
}

/** 区分 CellOptions 与 GridRenderCellParams（后者总有 field / api 等属性） */
function isOptions(obj: unknown): obj is CellOptions {
  return typeof obj === 'object' && obj !== null && !('field' in obj);
}

// ----------------------------------------------------------------------

const TooltipPopup = styled('div')(({ theme }) => ({
  padding: '4px 8px',
  fontSize: theme.typography.caption.fontSize,
  fontWeight: theme.typography.fontWeightMedium,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.grey[800],
  borderRadius: theme.shape.borderRadius,
  maxWidth: 400,
  wordBreak: 'break-word',
  userSelect: 'text',
  cursor: 'text',
  ...theme.applyStyles('dark', {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.grey[900],
  }),
}));

/**
 * 内部组件：检测溢出 → 用轻量 Popper 展示完整文本。
 * 鼠标可移入 Popper 浮层进行文本选择和复制，
 * 鼠标离开单元格 + 浮层后延迟关闭。
 */
function OverflowTooltipCell({
  text,
  align = 'center',
}: {
  text: string;
  align?: 'left' | 'center' | 'right';
}) {
  const cellRef = useRef<HTMLSpanElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const [open, setOpen] = useState(false);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const handleCellEnter = useCallback(() => {
    cancelClose();
    if (cellRef.current && isOverflown(cellRef.current)) {
      setOpen(true);
    }
  }, [cancelClose]);

  const handleCellLeave = useCallback(() => {
    scheduleClose();
  }, [scheduleClose]);

  const handlePopperEnter = useCallback(() => {
    cancelClose();
  }, [cancelClose]);

  const handlePopperLeave = useCallback(() => {
    scheduleClose();
  }, [scheduleClose]);

  return (
    <>
      <span
        ref={cellRef}
        onMouseEnter={handleCellEnter}
        onMouseLeave={handleCellLeave}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          display: 'block',
          textAlign: align,
        }}
      >
        {text}
      </span>

      {open && (
        <Popper
          open
          anchorEl={cellRef.current}
          placement="top"
          disablePortal={false}
          // modifiers={[{ name: 'offset', options: { offset: [0, 2] } }]}
          style={{ zIndex: 1500 }}
        >
          <TooltipPopup
            ref={popperRef}
            onMouseEnter={handlePopperEnter}
            onMouseLeave={handlePopperLeave}
          >
            {text}
          </TooltipPopup>
        </Popper>
      )}
    </>
  );
}
