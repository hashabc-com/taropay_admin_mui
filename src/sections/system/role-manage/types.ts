// ----------------------------------------------------------------------

export type Role = {
  id: number;
  role: string;
  description: string;
  resourceIds: string;
  createTime: string;
};

export type Resource = {
  id?: number;
  name?: string;
  type?: string;
  url?: string;
  parentId?: number;
  parentIds?: string;
  permission?: string;
  available?: boolean;
};

export type TreeNode = {
  id?: number;
  key: string;
  title: string;
  children?: TreeNode[];
};
