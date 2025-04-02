import server from "../server";

export default {
  Upload(data, config) {
    return server.post(`api/file/upload`, data, config);
  },
  GetFiles(data) {
    return server.post(`api/file/get/all`, data);
  },
  GetFile(data) {
    return server.get(`api/file/get/id/${data}`);
  },
  DeleteFile(data) {
    return server.post(`api/file/delete/id/${data}`);
  },
  GetFileInfo(data) {
    return server.get(`api/file/info/get/id/${data}`);
  },
};
