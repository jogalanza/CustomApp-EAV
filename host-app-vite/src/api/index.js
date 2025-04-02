import server from "../server";

export default {
  GetApiVersion() {
    return server.post(`version`);
  },
  GetCurrentUser() {
    return server.post(`api/account/current`);
  },
  GetUserAccessMenu(_id) {
    return server.post(`user/menu/${_id}`);
  },
  GetUserSites(_id) {
    return server.post(`svc/webmor/getRelatedSites/${_id}`);
  },
  ReviewPeriod_GetAll() {
    return server.get(`api/session/getAllPeriodsForReview`);
  },
  SiteRegions_GetAll() {
    return server.get(`api/session/siteregions`);
  },
  ReviewYear_GetAll() {
    return server.get(`api/session/getAllYearsForReview`);
  },
  GetLTMPeriods(periodId){
    return server.post(`api/session/ltm/${periodId}`);
  },
  GetUserProducts(_id) {
    return server.post(`user/products/${_id}`);
  },
  UserLogout() {
    return server.post(`user/logout`);
  }, 
  DashboardViewerCount(_id) {
    return server.post(`dashboard/viewers/${_id}`);
  },
  DashboardViewers(_id) {
    return server.post(`dashboard/viewers/people/${_id}`);
  },
  //ADMIN - GROUP ACCESS
  GroupAccess_GetAll(_filter) {
    return server.post(`grpaccs/getall`, { filter: _filter });
  },
  GroupAccess_Save(_info, _menu, _user) {
    return server.post(`grpaccs/save`, {
      info: _info,
      menu: _menu,
      userId: _user,
    });
  },
  GroupAccess_Remove(_id) {
    return server.post(`grpaccs/remove`, { id: _id });
  },
  GroupAccess_Menu(_id) {
    return server.post(`grpaccs/menu`, { Id: _id });
  },
  //ADMIN - EXCEPTION LOGS
  ExceptionLogs_GetAll(_filter) {
    return server.post(`exceptions/getall`, { filter: _filter });
  },
  //ADMIN - LOCALE
  Locale_GetAll(_filter) {
    return server.post(`locale/getall`, { filter: _filter });
  },
  //ADMIN - WEBHOOKS
  Webhooks_GetAll(_filter) {
    return server.post(`webhook/getall`, { filterOptions: _filter });
  },
  Webhooks_Save(_info) {
    return server.post(`webhook/save`, { info: _info });
  },
  Webhooks_Delete(_info) {
    return server.post(`webhook/delete`, { info: _info });
  },
  Webhooks_GetAllEvents() {
    return server.post(`webhook/events/getall`);
  },
  //PowerBI Reports
  EmbedReports_Get(_uid, _report) {
    return server.post(`report/embed/custom/get`, {
      userId: _uid,
      report: _report,
    });
  },
  EmbedReports_Save(info) {
    return server.post(`report/embed/custom/save`, info);
  },
  EmbedReports_Remove(_id) {
    return server.post(`report/embed/custom/delete`, {
      ID: _id,
    });
  },
};
