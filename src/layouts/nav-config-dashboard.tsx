import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

export const navData: NavSectionProps['data'] = [
  {
    items: [
      {
        title: '订单管理',
        path: paths.orders.root,
        icon: ICONS.order,
        children: [
          { title: '收款订单明细', path: paths.orders.receiveList },
          { title: '收款汇总', path: paths.orders.receiveSummary },
          { title: '付款订单明细', path: paths.orders.paymentList },
          { title: '付款汇总', path: paths.orders.paymentSummary },
          { title: '代收成功率', path: paths.orders.collectionRate },
        ],
      },
      {
        title: '日志管理',
        path: paths.logs.root,
        icon: ICONS.file,
        children: [
          { title: '消息记录', path: paths.logs.messageRecord },
          { title: '商户请求日志', path: paths.logs.merchantRequest },
          { title: '风控规则记录', path: paths.logs.riskControl },
        ],
      },
    ],
  },
];
