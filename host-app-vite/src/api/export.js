import server from "../server";

export default {
  ExportTable(info, _session) {
    // headers: {
    //   "Content-Type": "application/json",
    // },
    console.warn('export table', info)
    return server.post(
      `api/export/table`,
      {
        HtmlTable: info,
        session: _session
      },
      {
        responseType: "blob", // Ensure the response is treated as a binary Blob
      
      }
    );
  },
};
