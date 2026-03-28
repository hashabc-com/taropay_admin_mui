import type { NavSectionProps } from 'src/components/nav-section';

import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { useLanguage } from 'src/context/language-provider';

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

export function useNavData(): NavSectionProps['data'] {
  const { t } = useLanguage();

  return useMemo(
    () => [
      {
        items: [
          {
            title: t('sidebar.orderManagement'),
            path: paths.orders.root,
            icon: ICONS.order,
            children: [
              { title: t('sidebar.receiveOrders'), path: paths.orders.receiveList },
              { title: t('sidebar.receiveSummary'), path: paths.orders.receiveSummary },
              { title: t('sidebar.paymentOrders'), path: paths.orders.paymentList },
              { title: t('sidebar.paymentSummary'), path: paths.orders.paymentSummary },
              { title: t('sidebar.collectionSuccessRate'), path: paths.orders.collectionRate },
            ],
          },
          {
            title: t('sidebar.fundManagement'),
            path: paths.fund.root,
            icon: ICONS.banking,
            children: [
              { title: t('sidebar.settlementRecords'), path: paths.fund.settlementList },
              { title: t('sidebar.applicationApproval'), path: paths.fund.rechargeWithdraw },
              { title: t('sidebar.accountSettlement'), path: paths.fund.accountSettlement },
              { title: t('sidebar.merchantDailySummary'), path: paths.fund.merchantDailySummary },
              { title: t('sidebar.countryDailySummary'), path: paths.fund.countryDailySummary },
            ],
          },
          {
            title: t('sidebar.merchantManagement'),
            path: paths.merchant.root,
            icon: ICONS.user,
            children: [{ title: t('sidebar.merchantInfo'), path: paths.merchant.merchantInfo }],
          },
          {
            title: t('sidebar.businessManagement'),
            path: paths.business.root,
            icon: ICONS.job,
            children: [
              { title: t('sidebar.merchantBind'), path: paths.business.merchantBind },
              { title: t('sidebar.businessDailySummary'), path: paths.business.dailySummary },
              { title: t('sidebar.businessMonthlySummary'), path: paths.business.monthlySummary },
              { title: t('sidebar.customerConsult'), path: paths.business.customerConsult },
            ],
          },
          {
            title: t('sidebar.logManagement'),
            path: paths.logs.root,
            icon: ICONS.file,
            children: [
              { title: t('sidebar.messageRecord'), path: paths.logs.messageRecord },
              { title: t('sidebar.merchantRequest'), path: paths.logs.merchantRequest },
              { title: t('sidebar.riskControl'), path: paths.logs.riskControl },
            ],
          },
        ],
      },
    ],
    [t]
  );
}
