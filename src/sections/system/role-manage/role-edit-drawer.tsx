import useSWR from 'swr';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useLanguage } from 'src/context/language-provider';
import { createRole, updateRole, getResourceList } from 'src/api/system';

import { Iconify } from 'src/components/iconify';

import { type Role, type TreeNode, type Resource } from './types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  role: Role | null;
  isAdd: boolean;
  onSuccess: () => void;
};

// -- Tree Node Component --
function TreeNodeItem({
  node,
  selectedIds,
  onToggle,
  expandedIds,
  onExpand,
}: {
  node: TreeNode;
  selectedIds: number[];
  onToggle: (id: number, node: TreeNode) => void;
  expandedIds: Set<string>;
  onExpand: (key: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.key);
  const isChecked = node.id ? selectedIds.includes(node.id) : false;

  const isIndeterminate = useMemo(() => {
    if (!hasChildren || !node.id) return false;
    const childIds = node.children!.map((c) => c.id).filter((id): id is number => id !== undefined);
    const selectedChildCount = childIds.filter((id) => selectedIds.includes(id)).length;
    return !selectedIds.includes(node.id) && selectedChildCount > 0;
  }, [hasChildren, node.children, node.id, selectedIds]);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 0.25,
          '&:hover': { bgcolor: 'action.hover' },
          borderRadius: 0.5,
        }}
      >
        {hasChildren ? (
          <IconButton size="small" onClick={() => onExpand(node.key)} sx={{ mr: 0.5 }}>
            <Iconify
              icon={isExpanded ? 'eva:chevron-down-fill' : 'eva:chevron-right-fill'}
              width={16}
            />
          </IconButton>
        ) : (
          <Box sx={{ width: 32 }} />
        )}
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={isChecked}
              indeterminate={isIndeterminate}
              disabled={!node.id}
              onChange={() => node.id && onToggle(node.id, node)}
            />
          }
          label={<Typography variant="body2">{node.title}</Typography>}
          sx={{ m: 0 }}
        />
      </Box>
      {hasChildren && isExpanded && (
        <Box sx={{ ml: 4, borderLeft: '1px solid', borderColor: 'divider', pl: 1 }}>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.key}
              node={child}
              selectedIds={selectedIds}
              onToggle={onToggle}
              expandedIds={expandedIds}
              onExpand={onExpand}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export function RoleEditDrawer({ open, onClose, role, isAdd, onSuccess }: Props) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ role: '', description: '' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Fetch resource list
  const { data: resourceData } = useSWR(open ? ['resources'] : null, () =>
    getResourceList().then((res) => res.result || { resourceList: [] })
  );

  // Build tree from resourceList
  const treeData: TreeNode[] = useMemo(() => {
    const resources: Resource[] = resourceData?.resourceList || [];
    if (!resources.length) return [];

    const parentMap = new Map<number | undefined, Resource[]>();
    resources.forEach((r) => {
      const pid = r.parentId;
      if (!parentMap.has(pid)) parentMap.set(pid, []);
      parentMap.get(pid)!.push(r);
    });

    const buildTree = (parentId: number | undefined): TreeNode[] => {
      const children = parentMap.get(parentId) || [];
      return children.map((r) => {
        const childNodes = buildTree(r.id);
        return {
          id: r.id,
          key: r.id?.toString() || r.name || '',
          title: r.name || '',
          children: childNodes.length > 0 ? childNodes : undefined,
        };
      });
    };

    let tree = buildTree(undefined);
    if (tree.length === 0) tree = buildTree(0);
    return tree;
  }, [resourceData]);

  const resourceMap = useMemo(() => {
    const resources: Resource[] = resourceData?.resourceList || [];
    return new Map(resources.map((r) => [r.id, r]));
  }, [resourceData]);

  // Init form when opening
  useEffect(() => {
    if (open && role && !isAdd) {
      setForm({ role: role.role, description: role.description || '' });
      const ids = role.resourceIds.split(',').filter(Boolean).map(Number);
      setSelectedIds(ids);
      const expanded = new Set<string>();
      treeData.forEach((parent) => {
        if (parent.children?.some((child) => child.id && ids.includes(child.id))) {
          expanded.add(parent.key);
        }
      });
      setExpandedIds(expanded);
    } else if (open && isAdd) {
      setForm({ role: '', description: '' });
      setSelectedIds([]);
      setExpandedIds(new Set());
    }
  }, [open, role, isAdd, treeData]);

  const handleToggleId = useCallback(
    (id: number, _node: TreeNode) => {
      setSelectedIds((prev) => {
        const isRemoving = prev.includes(id);
        let newIds = isRemoving ? prev.filter((i) => i !== id) : [...prev, id];

        // Handle parent-child relationship
        const resource = resourceMap.get(id);
        if (resource?.parentId) {
          const parentId = resource.parentId;
          const siblingIds = (resourceData?.resourceList || [])
            .filter((r: Resource) => r.parentId === parentId && r.id)
            .map((r: Resource) => r.id!);

          if (isRemoving) {
            if (newIds.includes(parentId)) {
              newIds = newIds.filter((i) => i !== parentId);
            }
          } else {
            const allSiblingsSelected = siblingIds.every((sid: number) => newIds.includes(sid));
            if (allSiblingsSelected && !newIds.includes(parentId)) {
              newIds = [...newIds, parentId];
            }
          }
        }

        // Handle: toggling parent selects/deselects all children
        const childIds = (resourceData?.resourceList || [])
          .filter((r: Resource) => r.parentId === id && r.id)
          .map((r: Resource) => r.id!);

        if (childIds.length > 0) {
          if (isRemoving) {
            newIds = newIds.filter((i) => !childIds.includes(i));
          } else {
            childIds.forEach((cid: number) => {
              if (!newIds.includes(cid)) newIds.push(cid);
            });
          }
        }

        return newIds;
      });
    },
    [resourceMap, resourceData]
  );

  const handleExpand = useCallback((key: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = treeData
      .flatMap((parent) => [parent.id, ...(parent.children?.map((c) => c.id) || [])])
      .filter((id): id is number => id !== undefined);
    setSelectedIds(allIds);
    setExpandedIds(new Set(treeData.map((n) => n.key)));
  }, [treeData]);

  const handleClearAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isValid = form.role.trim() !== '' && selectedIds.length > 0;

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const payload = {
        role: form.role,
        description: form.description,
        resourceIds: selectedIds.join(','),
        ...(isAdd ? { createTime: dayjs().format('YYYY-MM-DD HH:mm:ss') } : { id: role!.id }),
      };
      const fn = isAdd ? createRole : updateRole;
      const res: any = await (fn as any)(payload);
      if (res.code == 200) {
        toast.success(isAdd ? t('common.addSuccess') : t('common.updateSuccess'));
        onClose();
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  }, [isValid, form, selectedIds, isAdd, role, t, onClose, onSuccess]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      PaperProps={{ sx: { width: { xs: '100%', sm: 540 } } }}
    >
      {open && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}
          >
            <Typography variant="h6">
              {isAdd ? t('system.roleManage.addRole') : t('system.roleManage.editRole')}
            </Typography>
            <IconButton onClick={onClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Box>
          <Divider />

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <TextField
              size="small"
              label={t('system.roleManage.roleName')}
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              placeholder={t('system.roleManage.placeholder.roleName')}
              required
            />

            <TextField
              size="small"
              label={t('common.description')}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder={t('system.roleManage.placeholder.roleDescription')}
              multiline
              rows={2}
              slotProps={{ htmlInput: { maxLength: 150 } }}
            />

            {/* Permissions tree */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2">
                  {t('system.roleManage.modulePermissions')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={handleSelectAll}>
                    {t('common.selectAll')}
                  </Button>
                  <Button size="small" variant="outlined" onClick={handleClearAll}>
                    {t('common.clear')}
                  </Button>
                </Box>
              </Box>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1.5,
                  maxHeight: 400,
                  overflow: 'auto',
                }}
              >
                {treeData.map((node) => (
                  <TreeNodeItem
                    key={node.key}
                    node={node}
                    selectedIds={selectedIds}
                    onToggle={handleToggleId}
                    expandedIds={expandedIds}
                    onExpand={handleExpand}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, p: 2 }}>
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
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
