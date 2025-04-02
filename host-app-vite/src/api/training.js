import server from "../server";

export default {
  GetAll(info, cancelToken) {
    return server.post(`api/training/getall`, info, {
      cancelToken: cancelToken === undefined ? null : cancelToken.token
    });
  },
  Save(info) {
    return server.post(`api/training/save`, info);
  },
  Delete(info) {
    return server.post(`api/training/delete`, info);
  },
};
