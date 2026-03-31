import useSWR from 'swr';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useLanguage } from 'src/context/language-provider';
import { getAllRoles, createAccount, updateAccount, getAccountById } from 'src/api/system';

import { Iconify } from 'src/components/iconify';

import { USER_TYPES, type IAccountType } from './types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  record: IAccountType | null;
  isAdd: boolean;
  onSuccess: () => void;
};

type FormState = {
  userName: string;
  account: string;
  password: string;
  mobile: string;
  roleIds: number;
  userType: number;
  disabledStatus: number;
};

const INITIAL: FormState = {
  userName: '',
  account: '',
  password: '',
  mobile: '',
  roleIds: 2,
  userType: 4,
  disabledStatus: 0,
};

export function AccountMutateDrawer({ open, onClose, record, isAdd, onSuccess }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Fetch role list for radio options
  const { data: rolesData } = useSWR(open ? ['system', 'all-roles'] : null, () => getAllRoles(), {
    revalidateOnFocus: false,
  });
  const roleList: { label: string; value: number }[] =
    rolesData?.result?.map((r: { role: string; id: number }) => ({ label: r.role, value: r.id })) ||
    [];

  // Populate form when editing
  useEffect(() => {
    if (!open) return;
    if (isAdd) {
      setForm(INITIAL);
      setErrors({});
      return;
    }
    if (record) {
      const fetchDetail = async () => {
        const res = await getAccountById({ id: record.id });
        const d = res?.result;
        if (d) {
          setForm({
            userName: d.userName || '',
            account: d.account || '',
            password: '',
            mobile: d.mobile || '',
            roleIds: d.roleIds ? Number(d.roleIds) : 2,
            userType: d.userType || 4,
            disabledStatus: d.disabledStatus ?? 0,
          });
        }
      };
      fetchDetail();
      setErrors({});
    }
  }, [open, record, isAdd]);

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.userName.trim()) e.userName = t('system.accountManage.validation.nameRequired');
    if (!form.account.trim()) e.account = t('system.accountManage.validation.accountRequired');
    if (isAdd && !form.password.trim())
      e.password = t('system.accountManage.validation.passwordRequired');
    if (!form.userType) e.userType = t('system.accountManage.validation.typeRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = isAdd
        ? {
            userName: form.userName,
            account: form.account,
            password: form.password,
            mobile: form.mobile || undefined,
            roleIds: form.roleIds,
            userType: form.userType,
            disabledStatus: form.disabledStatus,
          }
        : {
            id: record!.id,
            userName: form.userName,
            account: form.account,
            mobile: form.mobile || undefined,
            roleIds: form.roleIds,
            userType: form.userType,
            disabledStatus: form.disabledStatus,
          };

      const res = isAdd ? await createAccount(payload as any) : await updateAccount(payload as any);
      if (res.code == 200) {
        toast.success(isAdd ? t('common.addSuccess') : t('common.updateSuccess'));
        onSuccess();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof FormState, value: string | number) =>
    setForm((p) => ({ ...p, [key]: value }));

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 540 } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2.5, py: 2 }}
        >
          <Typography variant="h6">
            {isAdd
              ? t('system.accountManage.addAdministrator')
              : t('system.accountManage.editAdministrator')}
          </Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>

        <Divider />

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 3 }}>
          <Stack spacing={2.5}>
            {/* userName */}
            <TextField
              label={t('system.accountManage.name')}
              placeholder={t('system.accountManage.placeholder.name')}
              size="small"
              fullWidth
              value={form.userName}
              onChange={(e) => set('userName', e.target.value)}
              error={!!errors.userName}
              helperText={errors.userName}
            />

            {/* account */}
            <TextField
              label={t('common.account')}
              placeholder={t('system.accountManage.placeholder.account')}
              size="small"
              fullWidth
              value={form.account}
              onChange={(e) => set('account', e.target.value)}
              error={!!errors.account}
              helperText={errors.account}
            />

            {/* password (only for add) */}
            {isAdd && (
              <TextField
                label={t('common.password')}
                placeholder={t('system.accountManage.placeholder.password')}
                type="password"
                size="small"
                fullWidth
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
              />
            )}

            {/* mobile */}
            <TextField
              label={t('common.phone')}
              placeholder={t('system.accountManage.placeholder.phone')}
              size="small"
              fullWidth
              value={form.mobile}
              onChange={(e) => set('mobile', e.target.value)}
            />

            <Divider />

            {/* userType */}
            <FormControl error={!!errors.userType}>
              <FormLabel>{t('common.type')}</FormLabel>
              <RadioGroup
                row
                value={String(form.userType)}
                onChange={(e) => set('userType', Number(e.target.value))}
              >
                {Object.entries(USER_TYPES).map(([val, key]) => (
                  <FormControlLabel
                    key={val}
                    value={val}
                    control={<Radio size="small" />}
                    label={t(key)}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {/* roleIds */}
            <FormControl>
              <FormLabel>{t('common.role')}</FormLabel>
              <RadioGroup
                row
                value={String(form.roleIds)}
                onChange={(e) => set('roleIds', Number(e.target.value))}
              >
                {roleList.map((role) => (
                  <FormControlLabel
                    key={role.value}
                    value={String(role.value)}
                    control={<Radio size="small" />}
                    label={role.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Divider />

            {/* disabledStatus */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="subtitle2">
                  {t('system.accountManage.accountStatus')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {form.disabledStatus === 0 ? t('common.enabled') : t('common.disabled')}
                </Typography>
              </Box>
              <Switch
                checked={form.disabledStatus === 0}
                onChange={(e) => set('disabledStatus', e.target.checked ? 0 : 1)}
              />
            </Stack>
          </Stack>
        </Box>

        {/* Footer */}
        <Divider />
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ p: 2.5 }}>
          <Button variant="outlined" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? t('common.submitting') : t('common.confirm')}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
