import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { addConsumeRecord } from 'src/api/logs';
import { useLanguage } from 'src/context/language-provider';

import { useGoogleAuthDialog } from 'src/components/google-auth-dialog';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function AddMessageDialog({ open, onOpenChange, onSuccess }: Props) {
  const { t } = useLanguage();
  const [jsonMessage, setJsonMessage] = useState('');
  const { dialog: googleAuthDialog, withGoogleAuth } = useGoogleAuthDialog();

  const handleClose = useCallback(() => {
    setJsonMessage('');
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(() => {
    if (!jsonMessage.trim()) return;

    withGoogleAuth(async (gauthKey) => {
      const res = await addConsumeRecord({
        jsonMessage: jsonMessage.trim(),
        gauthCode: gauthKey,
      });
      if (res.code == 200) {
        toast.success(t('logs.messageRecord.addSuccess'));
        handleClose();
        onSuccess?.();
      } else {
        toast.error(res.message || t('logs.messageRecord.addFailed'));
      }
    });
  }, [jsonMessage, withGoogleAuth, t, handleClose, onSuccess]);

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('logs.messageRecord.addMessage')}</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={10}
            placeholder={t('logs.messageRecord.messageBodyPlaceholder')}
            value={jsonMessage}
            onChange={(e) => setJsonMessage(e.target.value)}
            sx={{
              mt: 1,
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: 'body2.fontSize',
                wordBreak: 'break-all',
              },
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!jsonMessage.trim()}>
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {googleAuthDialog}
    </>
  );
}
