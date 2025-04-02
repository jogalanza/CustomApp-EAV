import server from "../server";

export default {
  Upload(_info) {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    return server.post(`api/import/bulk`, _info, config);
  },
  UploadV2(_info) {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    return server.post(`api/import/v2/bulk`, _info, config);
  },
  DownloadTemplate() {
    return server.post(`api/import/export`);
  },
};
