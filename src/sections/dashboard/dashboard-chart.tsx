import type { ApexOptions } from 'apexcharts';
import type { DayChartData } from 'src/api/dashboard';

import { useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { useConvertAmount } from 'src/hooks/use-convert-amount';

import { useLanguage } from 'src/context/language-provider';

// ----------------------------------------------------------------------

type Props = {
  chartData?: DayChartData[];
};

type MetricKey = 'amount' | 'count' | 'service';

export function DashboardChart({ chartData }: Props) {
  const theme = useTheme();
  const { t } = useLanguage();
  const convertAmount = useConvertAmount();
  const [metric, setMetric] = useState<MetricKey>('amount');

  const metricConfig: Record<
    MetricKey,
    { collectKey: string; payoutKey: string; collectLabel: string; payoutLabel: string }
  > = useMemo(
    () => ({
      amount: {
        collectKey: 'collectAmount',
        payoutKey: 'payoutAmount',
        collectLabel: t('dashboard.collectionAmount'),
        payoutLabel: t('dashboard.paymentAmount'),
      },
      count: {
        collectKey: 'collectCount',
        payoutKey: 'payoutCount',
        collectLabel: t('dashboard.collectionCount'),
        payoutLabel: t('dashboard.paymentCount'),
      },
      service: {
        collectKey: 'collectServiceAmount',
        payoutKey: 'payoutServiceAmount',
        collectLabel: t('dashboard.collectionFee'),
        payoutLabel: t('dashboard.paymentFee'),
      },
    }),
    [t]
  );

  const config = metricConfig[metric];

  const processedData = useMemo(
    () =>
      (chartData || []).map((item) => ({
        date: item.date,
        collect: Number(
          convertAmount(item[config.collectKey as keyof DayChartData] as string, false, false)
        ),
        payout: Number(
          convertAmount(item[config.payoutKey as keyof DayChartData] as string, false, false)
        ),
      })),
    [chartData, convertAmount, config]
  );

  const categories = processedData.map((d) => d.date?.slice(5) || '');
  const collectSeries = processedData.map((d) => d.collect || 0);
  const payoutSeries = processedData.map((d) => d.payout || 0);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: theme.typography.fontFamily,
    },
    colors: [theme.palette.primary.main, theme.palette.warning.main],
    stroke: { width: 2.5, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: { opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.secondary, fontSize: '12px' } },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '12px' },
        formatter: (val: number) =>
          metric === 'count'
            ? String(Math.round(val))
            : new Intl.NumberFormat().format(Math.round(val)),
      },
    },
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider,
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: theme.palette.mode,
      x: { show: true },
      y: {
        formatter: (val: number) =>
          metric === 'count'
            ? String(Math.round(val))
            : new Intl.NumberFormat().format(Math.round(val)),
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: theme.palette.text.primary },
      fontSize: '13px',
      itemMargin: { horizontal: 12 },
      onItemClick: { toggleDataSeries: false },
      onItemHover: { highlightDataSeries: true },
    },
    dataLabels: { enabled: false },
  };

  const series = [
    { name: config.collectLabel, data: collectSeries },
    { name: config.payoutLabel, data: payoutSeries },
  ];

  return (
    <Card>
      <CardHeader
        title={t('dashboard.collectionPaymentStats')}
        subheader={t('dashboard.recentDaysComparison')}
        action={
          <Tabs
            value={metric}
            onChange={(_, v) => setMetric(v)}
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 2,
                py: 0.5,
                minHeight: 36,
                fontSize: 'body2.fontSize',
              },
              '& .MuiTabs-indicator': { borderRadius: 1 },
              minHeight: 36,
            }}
          >
            <Tab label={t('dashboard.totalAmount')} value="amount" />
            <Tab label={t('dashboard.orderCount')} value="count" />
            <Tab label={t('dashboard.serviceFee')} value="service" />
          </Tabs>
        }
        sx={{ p: 3, pb: 0 }}
      />

      <CardContent sx={{ pt: 2 }}>
        <Box sx={{ height: 320 }}>
          {processedData.length > 0 ? (
            <ReactApexChart type="area" series={series} options={chartOptions} height="100%" />
          ) : (
            <Box
              sx={{
                height: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.disabled',
                fontSize: 'body2.fontSize',
              }}
            >
              {t('common.noData')}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
