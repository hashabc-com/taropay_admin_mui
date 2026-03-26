import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useLanguage } from 'src/context/language-provider';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  content: string;
};

export function ParamsDetailDialog({ open, onClose, content }: Props) {
  const { t } = useLanguage();

  const formatted = (() => {
    if (!content) return '-';
    try {
      const obj = typeof content === 'string' ? JSON.parse(content) : content;
      return JSON.stringify(obj, null, 2);
    } catch {
      return content;
    }
  })();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('logs.riskControl.paramsDetail')}</DialogTitle>

      <DialogContent dividers>
        <Box
          component="pre"
          sx={{
            maxHeight: 600,
            overflow: 'auto',
            bgcolor: 'action.hover',
            borderRadius: 1,
            p: 2,
            fontSize: 'caption.fontSize',
            fontFamily: 'monospace',
            lineHeight: 2,
          }}
        >
          {formatted}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
