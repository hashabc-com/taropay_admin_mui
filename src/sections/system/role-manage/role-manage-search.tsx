import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { useListSearch } from 'src/hooks/use-list-search';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { DateTimeRangePicker } from 'src/components/date-time-range-picker';

import { FIELD_KEYS } from './hooks';

// ----------------------------------------------------------------------

type Props = {
  onAdd: () => void;
};

export function RoleManageSearch({ onAdd }: Props) {
  const { t } = useLanguage();
  const { values, setField, hasFilters, handleSearch, handleReset } = useListSearch(FIELD_KEYS);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <DateTimeRangePicker
        size="small"
        value={[
          values.createTimeBegin ? dayjs(values.createTimeBegin) : null,
          values.createTimeEnd ? dayjs(values.createTimeEnd) : null,
        ]}
        onChange={([start, end]) => {
          setField('createTimeBegin', start ? start.format('YYYY-MM-DD') : '');
          setField('createTimeEnd', end ? end.format('YYYY-MM-DD') : '');
        }}
      />

      <Button
        variant="contained"
        size="small"
        onClick={handleSearch}
        startIcon={<Iconify icon="eva:search-fill" />}
      >
        {t('common.search')}
      </Button>

      {hasFilters && (
        <Button
          variant="outlined"
          size="small"
          onClick={handleReset}
          startIcon={<Iconify icon="solar:close-circle-bold" />}
        >
          {t('common.reset')}
        </Button>
      )}

      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant="contained"
        size="small"
        onClick={onAdd}
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        {t('system.roleManage.addRole')}
      </Button>
    </Box>
  );
}
