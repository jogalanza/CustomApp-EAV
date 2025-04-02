import server from "../server";

export default {
  GetComment(info, cancelToken) {
    return server.post(`api/bowler/get/comment`, info, {
      cancelToken: cancelToken === undefined ? null : cancelToken.token
    });
  },
  GetPreviousComment(info, cancelToken) {
    return server.post(`api/bowler/get/comment/previous`, info, {
      cancelToken: cancelToken === undefined ? null : cancelToken.token
    });
  },
  SaveComment(info) {
    return server.post(`api/bowler/save/comment`, info);
  },
  Export(info, mode) {
    return server.post(`api/bowler/export?mode=${mode}`, info);
  },
};
