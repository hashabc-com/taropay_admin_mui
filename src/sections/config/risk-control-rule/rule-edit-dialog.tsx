import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useLanguage } from 'src/context/language-provider';
import { createRuleConfig, updateRuleConfig } from 'src/api/config';

import { SCENE_CODE_MAP, type RuleConfig, ACTION_CODE_MAP } from './types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  rule: RuleConfig | null;
  isAdd: boolean;
  onSuccess: () => void;
};

export function RuleEditDialog({ open, onClose, rule, isAdd, onSuccess }: Props) {
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    ruleName: '',
    ruleDesc: '',
    sceneCode: '',
    conditionExpr: '',
    actionCode: '',
    priority: 5,
    status: 1,
    actionParams: '',
  });

  useEffect(() => {
    if (open && rule && !isAdd) {
      setForm({
        ruleName: rule.ruleName,
        ruleDesc: rule.ruleDesc || '',
        sceneCode: rule.sceneCode,
        conditionExpr: rule.conditionExpr,
        actionCode: rule.actionCode,
        priority: rule.priority,
        status: rule.status,
        actionParams: rule.actionParams || '',
      });
    } else if (open && isAdd) {
      setForm({
        ruleName: '',
        ruleDesc: '',
        sceneCode: '',
        conditionExpr: '',
        actionCode: '',
        priority: 5,
        status: 1,
        actionParams: '',
      });
    }
  }, [open, rule, isAdd]);

  const setField = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isValid =
    form.ruleName.trim() !== '' &&
    form.sceneCode !== '' &&
    form.conditionExpr.trim() !== '' &&
    form.actionCode !== '';

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;

    // Validate actionParams JSON
    if (form.actionParams && form.actionParams.trim()) {
      try {
        JSON.parse(form.actionParams);
      } catch {
        toast.error(t('config.riskControlRule.actionParamsInvalidJson'));
        return;
      }
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (!isAdd && rule) {
        payload.id = rule.id;
      }

      const fn = isAdd ? createRuleConfig : updateRuleConfig;
      const res = await fn(payload);
      if (res.code == 200) {
        toast.success(t('common.operationSuccess'));
        onClose();
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  }, [isValid, form, isAdd, rule, t, onClose, onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isAdd ? t('config.riskControlRule.addRule') : t('config.riskControlRule.editRule')}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          size="small"
          label={t('config.riskControlRule.ruleName')}
          value={form.ruleName}
          onChange={(e) => setField('ruleName', e.target.value)}
          required
        />

        <TextField
          size="small"
          label={t('config.riskControlRule.ruleDescription')}
          value={form.ruleDesc}
          onChange={(e) => setField('ruleDesc', e.target.value)}
          multiline
          rows={2}
        />

        <FormControl size="small" required>
          <InputLabel>{t('config.riskControlRule.ruleScene')}</InputLabel>
          <Select
            label={t('config.riskControlRule.ruleScene')}
            value={form.sceneCode}
            onChange={(e) => setField('sceneCode', e.target.value)}
          >
            {Object.entries(SCENE_CODE_MAP).map(([code, labels]) => (
              <MenuItem key={code} value={code}>
                {labels[lang] || code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label={t('config.riskControlRule.conditionExpression')}
          value={form.conditionExpr}
          onChange={(e) => setField('conditionExpr', e.target.value)}
          multiline
          rows={2}
          placeholder={t('config.riskControlRule.conditionExprExample')}
          required
        />

        <FormControl size="small" required>
          <InputLabel>{t('config.riskControlRule.actionCode')}</InputLabel>
          <Select
            label={t('config.riskControlRule.actionCode')}
            value={form.actionCode}
            onChange={(e) => setField('actionCode', e.target.value)}
          >
            {Object.entries(ACTION_CODE_MAP).map(([code, labels]) => (
              <MenuItem key={code} value={code}>
                {labels[lang] || code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label={t('config.riskControlRule.priority')}
          type="number"
          value={form.priority}
          onChange={(e) => setField('priority', Number(e.target.value))}
          slotProps={{ htmlInput: { min: 1, max: 10 } }}
          placeholder={t('config.riskControlRule.priorityPlaceholder')}
        />

        <Box>
          <RadioGroup
            row
            value={String(form.status)}
            onChange={(e) => setField('status', Number(e.target.value))}
          >
            <FormControlLabel
              value="1"
              control={<Radio size="small" />}
              label={t('common.enabled')}
            />
            <FormControlLabel
              value="0"
              control={<Radio size="small" />}
              label={t('common.disabled')}
            />
          </RadioGroup>
        </Box>

        <TextField
          size="small"
          label={t('config.riskControlRule.actionParams')}
          value={form.actionParams}
          onChange={(e) => setField('actionParams', e.target.value)}
          multiline
          rows={3}
          placeholder={t('config.riskControlRule.actionParamsPlaceholder')}
        />
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? t('common.submitting') : t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
