import type { MerchantInfo } from 'src/api/merchant';

import { toast } from 'sonner';
import { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { unbindGoogle } from 'src/api/merchant';
import { useLanguage } from 'src/context/language-provider';

import { useGoogleAuthDialog } from 'src/components/google-auth-dialog';

// ----------------------------------------------------------------------

type UnbindKeyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: MerchantInfo | null;
  onSuccess: () => void;
};

export function UnbindKeyDialog({ open, onOpenChange, merchant, onSuccess }: UnbindKeyDialogProps) {
  const { t } = useLanguage();
  const { dialog: googleAuthDialog, withGoogleAuth } = useGoogleAuthDialog();
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    if (!merchant) return;

    withGoogleAuth(async (gauthKey) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('merchantId', merchant.appid);
        formData.append('googleCode', gauthKey);
        formData.append('secretKey', '');
        const res = await unbindGoogle(formData);

        if (res.code == 200) {
          toast.success(t('merchant.info.success.unbindSuccess'));
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(res.message || t('merchant.info.error.unbindFailed'));
        }
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <>
      <Dialog open={open} onClose={() => !loading && onOpenChange(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('merchant.info.unbindSecretKey')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('merchant.info.unbindSecretKeyFor')} <strong>{merchant?.companyName}</strong>
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
            {loading ? t('common.submitting') : t('merchant.info.confirmUnbind')}
          </Button>
        </DialogActions>
      </Dialog>

      {googleAuthDialog}
    </>
  );
}
