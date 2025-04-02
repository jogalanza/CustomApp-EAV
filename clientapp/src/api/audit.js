import server from "../server";

export default {
  GetEditHistory(info, cancelToken) {
    return server.post(`api/audit/get/edithsitory`, info, {
      cancelToken: cancelToken === undefined ? null : cancelToken.token
    });
  },
};
