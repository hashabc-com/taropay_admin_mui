import type { MerchantUser } from 'src/api/merchant-user';

import { toast } from 'sonner';
import { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { unbindGoogleAuth } from 'src/api/merchant-user';
import { useLanguage } from 'src/context/language-provider';

import { useGoogleAuthDialog } from 'src/components/google-auth-dialog';

// ----------------------------------------------------------------------

type UnbindGoogleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: MerchantUser | null;
  onSuccess: () => void;
};

export function UnbindGoogleDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UnbindGoogleDialogProps) {
  const { t } = useLanguage();
  const { dialog: googleAuthDialog, withGoogleAuth } = useGoogleAuthDialog();
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    if (!user) return;

    withGoogleAuth(async (gauthKey) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('googleCode', gauthKey);
        formData.append('id', String(user.id));

        const res = await unbindGoogleAuth(formData);

        if (res.code == 200) {
          toast.success(t('merchantAccount.unbindGoogleSuccess'));
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(res.message || t('merchantAccount.unbindGoogleFailed'));
        }
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <>
      <Dialog open={open} onClose={() => !loading && onOpenChange(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('merchantAccount.unbindGoogle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('merchantAccount.unbindGoogleConfirm')} <strong>{user?.account}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirm}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? t('common.submitting') : t('merchantAccount.confirmUnbind')}
          </Button>
        </DialogActions>
      </Dialog>

      {googleAuthDialog}
    </>
  );
}
