import http from 'src/lib/http';

// ====== Role Management ======

export const getRoleList = (params: {
  pageNum?: number;
  pageSize?: number;
  role?: string;
  createTimeBegin?: string;
  createTimeEnd?: string;
}) => http.get('/admin/rolemanage/v1/selectallpage', params);

export const getAllRoles = () => http.get('/admin/rolemanage/v1/selectroles');

export const getResourceList = () => http.get('/admin/rolemanage/v1/selectresourcelist');

export const createRole = (data: {
  role: string;
  description: string;
  resourceIds: string;
  createTime: string;
}) => http.post('/admin/rolemanage/v1/insertrole', data);

export const updateRole = (data: {
  id: number;
  role: string;
  description: string;
  resourceIds: string;
}) => http.post('/admin/rolemanage/v1/updaterolebyid', data);

export const deleteRole = (data: FormData) => http.post('/admin/rolemanage/v1/deleterole', data);

// ====== Account Management ======

export const getAccountList = (params: {
  pageNum?: number;
  pageSize?: number;
  searchType?: string;
  searchContent?: string;
  createTimeBegin?: string;
  createTimeEnd?: string;
}) => http.get('/admin/accountmanage/v1/selectlist', params);

export const getAccountById = (params: { id: number }) =>
  http.get('/admin/accountmanage/v1/selectbyid', params);

export const createAccount = (data: {
  userName: string;
  account: string;
  password: string;
  mobile?: string;
  roleIds: number;
  userType: number;
  disabledStatus: number;
}) => http.post('/admin/accountmanage/v1/insertaccount', data);

export const updateAccount = (data: {
  id: number;
  userName: string;
  account: string;
  mobile?: string;
  roleIds: number;
  userType: number;
  disabledStatus: number;
}) => http.post('/admin/accountmanage/v1/updateAccount', data);

export const updatePassword = (data: { id: number; pwd: string; rePwd: string }) =>
  http.post('/admin/accountmanage/v1/updatepassword', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

export const updateDisabledStatus = (data: { id: number; disableStatus: number }) =>
  http.post('/admin/accountmanage/v1/updatedisabledstatus', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

export const deleteAccount = (data: { id: number }) =>
  http.post('/admin/accountmanage/v1/deleteaccount', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
