import type { MerchantBindRecord } from './hooks';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useLanguage } from 'src/context/language-provider';
import { updateBusinessBind, getMerchantsByBusinessId } from 'src/api/business';

// ----------------------------------------------------------------------

type MerchantItem = {
  customerappId: string;
  customerName: string;
  country: string;
  status: number;
};

type Props = {
  open: boolean;
  business: MerchantBindRecord | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function BindMerchantDialog({ open, business, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [merchants, setMerchants] = useState<MerchantItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open && business) {
      loadMerchants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, business]);

  const loadMerchants = async () => {
    if (!business) return;
    setLoading(true);
    try {
      const res = await getMerchantsByBusinessId({ supervisorsId: business.id });
      const data = (res as any)?.result || res;
      const list: MerchantItem[] = Array.isArray(data) ? data : [];
      setMerchants(list);
      setSelected(list.filter((m) => m.status === 1).map((m) => m.customerappId));
    } catch {
      toast.error(t('common.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (appId: string) => {
    setSelected((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const handleSubmit = async () => {
    if (!business) return;
    setSubmitting(true);
    try {
      const customerList = selected.map((appId) => {
        const merchant = merchants.find((m) => m.customerappId === appId);
        return { customerappId: appId, country: merchant?.country || null };
      });
      const res = await updateBusinessBind({
        supervisorsName: business.userName,
        supervisorsId: business.id,
        customerList,
      });
      if (res.code == 200) {
        toast.success(t('business.merchantBind.bindSuccess'));
        onSuccess();
      } else {
        toast.error(res?.message || t('common.operationFailed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('business.merchantBind.bindMerchant')}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t('business.merchantBind.businessUserName')}: <strong>{business?.userName}</strong>
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : merchants.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            {t('common.noData')}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {merchants.map((m) => (
              <FormControlLabel
                key={m.customerappId}
                label={m.customerName}
                control={
                  <Checkbox
                    checked={selected.includes(m.customerappId)}
                    onChange={() => handleToggle(m.customerappId)}
                    size="small"
                  />
                }
              />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting || loading}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || loading}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {submitting ? t('common.submitting') : t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
