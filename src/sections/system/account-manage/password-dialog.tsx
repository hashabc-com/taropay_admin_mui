import { toast } from 'sonner';
import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { updatePassword } from 'src/api/system';
import { useLanguage } from 'src/context/language-provider';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  accountId: number | null;
  onSuccess: () => void;
};

export function PasswordDialog({ open, onClose, accountId, onSuccess }: Props) {
  const { t } = useLanguage();
  const [pwd, setPwd] = useState('');
  const [rePwd, setRePwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ pwd?: string; rePwd?: string }>({});

  const handleClose = () => {
    setPwd('');
    setRePwd('');
    setErrors({});
    onClose();
  };

  const validate = (): boolean => {
    const e: { pwd?: string; rePwd?: string } = {};
    if (!pwd.trim()) e.pwd = t('system.accountManage.validation.newPasswordRequired');
    if (!rePwd.trim()) e.rePwd = t('system.accountManage.validation.confirmPasswordRequired');
    if (pwd && rePwd && pwd !== rePwd) e.rePwd = t('system.accountManage.passwordMismatch');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !accountId) return;
    setLoading(true);
    try {
      const res = await updatePassword({ id: accountId, pwd, rePwd });
      if (res.code == 200) {
        toast.success(t('system.accountManage.passwordUpdateSuccess'));
        onSuccess();
        handleClose();
      } else {
        toast.error(res.message || t('system.accountManage.passwordUpdateFailed'));
      }
    } catch {
      toast.error(t('system.accountManage.passwordUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('system.accountManage.changePassword')}</DialogTitle>
      <DialogContent dividers sx={{ pt: 3 }}>
        <Stack spacing={2.5}>
          <TextField
            label={t('system.accountManage.newPassword')}
            placeholder={t('system.accountManage.placeholder.newPassword')}
            type="password"
            size="small"
            fullWidth
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            error={!!errors.pwd}
            helperText={errors.pwd}
          />
          <TextField
            label={t('common.confirmPassword')}
            placeholder={t('system.accountManage.placeholder.confirmPassword')}
            type="password"
            size="small"
            fullWidth
            value={rePwd}
            onChange={(e) => setRePwd(e.target.value)}
            error={!!errors.rePwd}
            helperText={errors.rePwd}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? t('common.submitting') : t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
