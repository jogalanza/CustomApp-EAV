// import { createStore } from "vuex";
// import user from "./module/user";
// import options from "./module/options";
// import locale from "./module/locale";
import api from "../api/index";
import apiSession from "../api/session";
import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({
    boardTitle: "",
    darkMode: 0,
    installable: false,
    installPrompt: null,
    connectionInfo: null,
    wsConnected: false,
    wsName: null,
    appNewUpdates: null,
    hasNewUpdates: false,
    currentPeriod: null,

    adhocTour: false,
    activeSession: {},
    //dashboard
    dashboardFilter: {
      Year: null,
      Month: null,
      Site: [],
      SBU: [],
      BusinessLine: [],
      ProductFamily: [],
      Function: [],
    },
    activeDashboard: {},
    activeBoards: [],
    dashboardView: "chart",
    //Users and Roles
    activeRole: {},
    reviewPeriods: [],
    siteRegions: [],
    reviewYears: [],
    sessionOptions: {
      Period: null,
      Site: null,
      Year: 0,
      Consolidated: false,
      UseOpenPeriod: true,
      Hedged: true,
      Compare: false,
      Region: {
        Name: "",
        Label: "Excelitas TOTAL"
      }
    },
    ltmPeriods: [
      { DESCRIPTION: "Jan-2023" },
      { DESCRIPTION: "Feb-2023" },
      { DESCRIPTION: "Mar-2023" },
      { DESCRIPTION: "Apr-2023" },
      { DESCRIPTION: "May-2023" },
      { DESCRIPTION: "Jun-2023" },
      { DESCRIPTION: "Jul-2023" },
      { DESCRIPTION: "Aug-2023" },
      { DESCRIPTION: "Sep-2023" },
      { DESCRIPTION: "Oct-2023" },
      { DESCRIPTION: "Nov-2023" },
      { DESCRIPTION: "Dec-2023" }
    ],
    appSessionInfo: {
      Users: 0,
      Sessions: 0
    },
    serverResources: {
      CPU: "N/A",
      RAM: "N/A"
    }, 
    months: [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' 
    ],
    compareSites: []
  }),

  getters: {
    CurrentYear: (state) => {
      return state.currentYear === 0 ? new Date().getFullYear() : state.currentYear;
    },
    ReviewPeriods: (state) => {
      return [...state.reviewPeriods];
    },
    SiteRegions: (state) => {
      return [...state.siteRegions];
    },
    ReviewYears: (state) => {
      return [...state.reviewYears];
    },
    SessionOptions: (state) => {
      if (state.sessionOptions.Year === 0){
        state.sessionOptions.Year = new Date().getFullYear();
      }
      return { ...state.sessionOptions };
    },
    InvalidPeriodSession: (state) => {
      return !state.sessionOptions.Period || !state.sessionOptions.Site;
    },
    LTMPeriods: (state) => {
      return [ ...state.ltmPeriods ];
    },
    BowlerPeriods: (state) => {
      var x = [];
      state.months.forEach(element => {
        x.push(`${element.substring(0, 3)}`);
      });
      return [ ...x ];
    },
    DashboardView: (state) => {
      return state.dashboardView;
    },
    DasboardTitle: (state) => {
      console.warn("eval dashboard title")
      if (state.SessionOptions.Period && state.SessionOptions.Consolidated){
        return `${state.SessionOptions.Period.DESCRIPTION}`;
      }else if(state.SessionOptions.Period && state.SessionOptions.Site){
        return `${state.SessionOptions.Site.SiteName} - ${state.SessionOptions.Period.DESCRIPTION}`;
      }
      
      return `Site - Period`;
    },
    ActiveDashboard: (state) => {
      return { ...state.activeDashboard };
    },
    ActiveBoards: (state) => {
      return { ...state.activeBoards };
    },
    DashboardFilter: (state) => {
      return state.dashboardFilter;
    },
    getAppName: () => {
      return "App Name";
    },
    BoardTitle: (state) => {
      return state.boardTitle;
    },
    Years: (state) => {
      
      var currentYear = state.currentYear === 0 ? new Date().getFullYear() : state.currentYear;
      var years = [currentYear - 1, currentYear, currentYear + 1];
      // var startYear = 2020;
      // while (startYear <= currentYear) {
      //   years.push(startYear++);
      // }
      return years; //.reverse();
    },
    SnapshotYears: (state) => {
      return [...state.snapshotYears];
    },
    AccessModes() {
      return [
        { label: "No access", value: 0 },
        { label: "Read only", value: 1 },
        { label: "Read and Write", value: 2 }
      ]
    },
    Months() {
      return [
        { label: "January", value: 1 },
        { label: "February", value: 2 },
        { label: "March", value: 3 },
        { label: "April", value: 4 },
        { label: "May", value: 5 },
        { label: "June", value: 6 },
        { label: "July", value: 7 },
        { label: "August", value: 8 },
        { label: "September", value: 9 },
        { label: "October", value: 10 },
        { label: "November", value: 11 },
        { label: "December", value: 12 },
      ];
    },
    Weeks() {
      var weeks = [];
      var seed = 1;
      while (seed <= 53) {
        weeks.push(seed);
        seed++;
      }
      return weeks;
    },
    Quarters() {
      var weeks = [];
      var seed = 1;
      while (seed <= 53) {
        weeks.push(seed);
        seed++;
      }
      return [
        { label: "Q1", value: 1 },
        { label: "Q2", value: 2 },
        { label: "Q3", value: 3 },
        { label: "Q4", value: 4 },
      ];
    },
    Snapshot: (state) => {
      return { ...state.sessionOptions };
    },
    AppSessionInfo(state) {
      return {...state.appSessionInfo};
    },
    ServerResources(state) {
      return {...state.serverResources};
    },
    DarkMode(state) {
      return state.darkMode == 1;
    },
    Installable(state) {
      return state.installable;
    },
    InstallPrompt(state) {
      return state.installPrompt;
    },
    ConnectionInfo(state) {
      return state.connectionInfo;
    },
    CurrentPeriod(state) {
      return state.currentPeriod;
    },
    CompareSites: (state) => {
      return state.compareSites;
    },
  },

  actions: {
    GetReviewPeriods(){
      api.ReviewPeriod_GetAll().then(response => {
        this.reviewPeriods = [...response.data.periods];
      })
    },
    GetSiteRegions(){
      api.SiteRegions_GetAll().then(response => {
        this.siteRegions = [...response.data.periods];
      })
    },
    GetReviewYears(){
      api.ReviewYear_GetAll().then(response => {
        this.reviewYears = [...response.data.periods];
      })
    },
    SetDashboardView(payload){
      this.dashboardView = payload;
      sessionStorage.setItem("morsessionview", payload);
    },
    SetActiveDashboard(payload) {
      return new Promise((resolve) => {
        this.activeDashboard = { ...payload };
        resolve();
      });
    },
    SyncDashboardFilter(payload) {
      return new Promise((resolve) => {
        this.dashboardFilter = { ...payload };
        resolve();
      });
    },
    AddActiveBoard(payload){
      return new Promise((resolve) => {
        this.activeBoards.push({ ...payload });
        resolve();
      });
    },
    SyncSessionOptions(payload){
      console.warn("sync session optsiopn", payload)
      var hedged = this.sessionOptions.Hedged;
      this.sessionOptions = {...payload};
      this.sessionOptions.Hedged = hedged;
      console.warn("sync session optsiopn", payload, this.sessionOptions)
      if (payload.Period){
        this.sessionOptions.Year = payload.Period.PERIOD_YEAR;
      }
      

      if (this.sessionOptions.Site && this.sessionOptions.Site.SiteId > 0 && this.sessionOptions.Period && this.sessionOptions.Period.PERIOD_ID > 0){
        sessionStorage.setItem("morsession", JSON.stringify(this.sessionOptions));
      }

      if (this.sessionOptions.Period && this.sessionOptions.Period?.PERIOD_ID !== undefined && this.sessionOptions.Period.PERIOD_ID > 0){
        this.GetLTMPeriod(this.sessionOptions.Period.PERIOD_ID);
      }

      this.GetCompareSites(this.sessionOptions);
    },
    ToggleHedged(){
      this.sessionOptions.Hedged = !this.sessionOptions.Hedged;
      sessionStorage.setItem("morsession", JSON.stringify(this.sessionOptions));
    },
    GetLTMPeriod(payload){
      api.GetLTMPeriods(payload).then(response => {
        this.ltmPeriods = [...response.data.result]
      })
    },
    SyncAppSessionInfo(payload){
      this.appSessionInfo = {...payload};
    },
    SyncServerResources(payload){
      this.serverResources = {...payload};
    },
    UpdateBoardTitle(payload) {
      this.boardTitle = payload;
    },
    SetAdHocTour(payload){
      this.adhocTour = payload;
    },
    UpdateDarkMode(payload) {
      this.darkMode = payload;
      window.localStorage.setItem("darkMode", payload);
    },
    SetInstallPrompt(payload) {
      this.installPrompt = payload;
    },
    SetInstallable(payload) {
      this.installable = payload;
    },
    GetCurrentPeriod() {
      api.GetCurrentPeriod().then((response) => {
        if (response.data === null) {
          this.currentPeriod = null;
        } else {
          this.currentPeriod = { ...response.data };
          this.currentPeriod.Quarter = Math.ceil(this.currentPeriod.Month / 3);
        }
      });
    },
    UpdateSocketStatus(data) {
      this.wsConnected = data;
      if (!data) this.wsName = null;
    },
    UpdateSocketName(data) {
      this.wsName = data;
    },
    SetAppUpdate(data) {
      this.appNewUpdates = data;
      this.hasNewUpdates = true;
    },
    SetHasNewUpdates(data) {
      this.hasNewUpdates = data;
    },
    SetActiveRole(data) {
      this.activeRole = { ...data };
    },
    GetCompareSites(data){
      apiSession.GetCompareSites(data).then(response => {
        this.compareSites = [...response.data]
      })
    }
  },
});
