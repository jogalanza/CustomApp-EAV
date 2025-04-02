import server from "../server";

export default {
  UserGetAll(_filter) {
    return server.post(`api/account/getall`, _filter);
  },
  UserApproveAccess(id) {
    return server.post(`api/account/approve/?id=${id}`);
  },
  UserAccessRequest(_info) {
    return server.post(`access/request`, _info);
  },
  GetUserByID(id) {
    return server.post(`api/account/get/${id}`);
  },
  UserSave(_info) {
    return server.post(`api/account/save`, _info);
  },
  UserDelete(_ids) {
    return server.post(`api/account/delete`, _ids);
  },
  UserExport(_pagination) {
    return server.post(`api/account/export`, _pagination, {
      responseType: "blob",
    });
  },
  UserRoles(_id) {
    return server.post(`api/account/roles/${_id}`);
  },
  RoleGetAll(_filter) {
    return server.post(`role/all`, _filter);
  },
  RoleAccessMenu(id) {
    return server.post(`role/access/menu/${id}`);
  },
  RoleSave(role, menu) {
    return server.post(`role/save`, {
      Role: role,
      Access: menu,
    });
  },
  RoleDelete(_ids) {
    return server.post(`role/delete`, _ids);
  },
  SearchInAD(name, token){
    return server.post(`api/account/ad/search`, {
      data: name
    }, {
      cancelToken: token
    });
  }
};
