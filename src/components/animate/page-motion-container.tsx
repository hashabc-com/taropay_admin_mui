import type { MotionProps } from 'framer-motion';
import type { BoxProps } from '@mui/material/Box';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';

import { varContainer } from './variants';

// ----------------------------------------------------------------------

export type PageMotionContainerProps = BoxProps &
  MotionProps & {
    /** Disable animation on small screens (default: true) */
    disableAnimate?: boolean;
  };

/**
 * 页面级入场动画容器。
 *
 * 将子元素包裹在 `MotionViewport` 中，子元素使用 `m.div` + `varFade('inUp')` 即可获得
 * stagger 入场效果。sm 以下默认禁用动画。
 *
 * ```tsx
 * <PageMotionContainer>
 *   <m.div variants={varFade('inUp')}><Card>...</Card></m.div>
 *   <m.div variants={varFade('inUp')}><DataGrid ... /></m.div>
 * </PageMotionContainer>
 * ```
 */
export function PageMotionContainer({
  children,
  viewport,
  disableAnimate = true,
  ...other
}: PageMotionContainerProps) {
  const smDown = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const disabled = smDown && disableAnimate;

  const baseProps = disabled
    ? {}
    : {
        component: m.div,
        initial: 'initial',
        whileInView: 'animate',
        variants: varContainer({ transitionIn: { staggerChildren: 0.12, delayChildren: 0.05 } }),
        viewport: { once: true, amount: 0.1, ...viewport },
      };

  return (
    <Box {...baseProps} {...other}>
      {children}
    </Box>
  );
}
