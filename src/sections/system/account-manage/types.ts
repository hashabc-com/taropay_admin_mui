export type IAccountType = {
  id: number;
  userName: string;
  account: string;
  password?: string;
  mobile?: string;
  roleIds: number | string;
  userType: number;
  disabledStatus: number;
  createTime?: string;
  updateTime?: string;
};

export const USER_TYPES: Record<number, string> = {
  1: 'system.accountManage.userTypes.superAdmin',
  2: 'system.accountManage.userTypes.finance',
  3: 'system.accountManage.userTypes.business',
  4: 'system.accountManage.userTypes.other',
};
