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

/**
 * 通用的 DataGrid 单元格渲染：文本溢出时显示省略号 + hover 显示完整内容的 Tooltip。
 *
 * **仅当文本确实被截断时才弹出 Tooltip**，短文本不会弹出多余气泡。
 *
 * ## 用法
 *
 * ```ts
 * { field: 'name', headerName: '名称', width: 120, renderCell: renderCellWithTooltip }
 * ```
 */
export function renderCellWithTooltip(params: GridRenderCellParams) {
  const value = params.formattedValue ?? params.value;
  const text = value == null || value === '' ? '-' : String(value);

  return <OverflowTooltipCell text={text} />;
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
  pointerEvents: 'none',
  ...theme.applyStyles('dark', {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.grey[900],
  }),
}));

/**
 * 内部组件：检测溢出 → 用轻量 Popper 展示完整文本（无动画、无跳动）。
 */
function OverflowTooltipCell({ text }: { text: string }) {
  const cellRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (cellRef.current && isOverflown(cellRef.current)) {
      setOpen(true);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <span
        ref={cellRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          display: 'block',
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
          modifiers={[{ name: 'offset', options: { offset: [0, 6] } }]}
          style={{ zIndex: 1500, pointerEvents: 'none' }}
        >
          <TooltipPopup>{text}</TooltipPopup>
        </Popper>
      )}
    </>
  );
}
