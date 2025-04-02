import server from "../server";

export default {
  GetAR(info, cancelToken) {
    return server.post(`api/ar/get`, info, {
      cancelToken: cancelToken === undefined ? null : cancelToken.token
    });
  },
  Save(info, cancelToken) {
    return server.post(`api/ar/save`, info, {
      cancelToken: cancelToken === undefined ? null : cancelToken.token
    });
  },
  Delete(info, cancelToken) {
    return server.post(`api/ar/delete/${info}`, info, {
      cancelToken: cancelToken === undefined ? null : cancelToken.token
    });
  },
  Export(info, mode) {
    return server.post(`api/ar/export?mode=${mode}`, info);
  },
};
