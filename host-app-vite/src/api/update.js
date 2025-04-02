import server from "../server";

export default {
  GetAll(filterOptions, _export) {
    return server.post(`api/update/getall${(_export ? '/?export=1' : '')}`, filterOptions);
  },
  Save(_info, _userId) {
    return server.post(`api/update/save`, {
      info: _info,
      userId: _userId,
    });
  },
  Delete(_info, _userId) {
    return server.post(`api/update/delete`, {
      ids: _info,
      userId: _userId,
    });
  },
  Upload(data, userId, progressCallback) {
    return server.post(`api/update/upload/?userid=${userId}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress:
        progressCallback !== undefined ? progressCallback : function() {},
    });
  },
};
