import api from "../api/index";
import lookupApi from "../api/lookup";
//import general from "../mixins/general";
import { defineStore } from "pinia";

export const useUser = defineStore("user", {
  state: () => ({
    activeUser: null,
    homefilter: { key: null },
    groupMenu: null,
    viewerMenu: [
      // {
      //   label: "Home",
      //   key: "HOME",
      //   always: null,
      //   langkey: "HOME",
      //   icon: "o_home",
      //   link: "/",
      //   route: { name: "Home" },
      // },
      // {
      //   label: "Summary",
      //   key: "SUM",
      //   always: null,
      //   langkey: "SUMMARY",
      //   icon: "o_summarize",
      //   link: "/summary",
      //   route: { name: "Summary" },
      // },
      {
        label: "Bowler",
        key: "BOWLER",
        always: null,
        langkey: "BOELWER",
        icon: "o_ads_click",
        link: "/",
        route: { name: "Bowler" },
      },
      {
        label: "Corporate",
        key: "CORP",
        always: null,
        langkey: "CORPORATE",
        icon: "o_corporate_fare",
        link: "/dashboard?category=Corporate",
        route: { name: "Dashboard", query: { category: "Corporate" } },
      },
      {
        label: "Supply Chain",
        key: "SUCHAIN",
        always: null,
        langkey: "SUPPLY_CHAIN",
        icon: "o_inventory_2",
        link: "/dashboard?category=Supply+Chain",
        route: { name: "Dashboard", query: { category: "Supply Chain" } },
      },
      {
        label: "OpEx",
        key: "OPEX",
        always: null,
        langkey: "OPEX",
        icon: "o_request_quote",
        link: "/dashboard?category=OpEx",
        route: { name: "Dashboard", query: { category: "OpEx" } },
      },
      {
        label: "Training",
        key: "TRAINING",
        always: null,
        langkey: "TRAINING",
        icon: "o_school",
        link: "/training",
        route: { name: "Training" },
      },
      {
        label: "Manage",
        key: "MANAGE",
        always: null,
        langkey: "TRAINING",
        icon: "o_manage_accounts",
        link: "/training",
        route: { name: "Training" },
        roles: [1, 3],
        items: [
          {
            label: "Periods",
            key: "M_PERIOD",
            langkey: "MANAGE_PERIODS",
            icon: "o_event",
            route: { name: "ManagePeriod" },
            ignoreItems: true,
            link: "/admin/period",
            items: [
              {
                label: "View",
                key: "M_PERIOD_VIEW",
                langkey: "VIEW",
                icon: "r_visibility",
              },
              {
                label: "Edit",
                key: "M_PERIOD_EDIT",
                langkey: "EDIT",
                icon: "r_edit",
              },
            ],
          },
          {
            label: "Sites",
            key: "M_SITE",
            langkey: "MANAGE_SITE",
            icon: "o_qr_code",
            route: { name: "ManageSites" },
            ignoreItems: true,
            link: "/admin/sites",
            items: [
              {
                label: "View",
                key: "M_SITE_VIEW",
                langkey: "VIEW",
                icon: "r_visibility",
              },
              {
                label: "Edit",
                key: "M_SITE_EDIT",
                langkey: "EDIT",
                icon: "r_edit",
              },
            ],
          },
          {
            label: "Targets",
            key: "M_TARGETS",
            langkey: "MANAGE_TARGETS",
            icon: "o_track_changes",
            route: { name: "ManageTargets" },
            ignoreItems: true,
            link: "/admin/targets",
            items: [
              {
                label: "View",
                key: "M_TARGETS_VIEW",
                langkey: "VIEW",
                icon: "r_visibility",
              },
              {
                label: "Edit",
                key: "M_TARGETS_EDIT",
                langkey: "EDIT",
                icon: "r_edit",
              },
            ],
          },
          // {
          //   label: "Suppliers",
          //   key: "M_SUPPLIERS",
          //   langkey: "MANAGE_SUPPLIERS",
          //   icon: "o_precision_manufacturing",
          //   route: { name: "ManageSuppliers" },
          //   ignoreItems: true,
          //   link: "/admin/suppliers",
          //   items: [
          //     {
          //       label: "View",
          //       key: "M_SUPPLIERS_VIEW",
          //       langkey: "VIEW",
          //       icon: "r_visibility",
          //     },
          //     {
          //       label: "Edit",
          //       key: "M_SUPPLIERS_EDIT",
          //       langkey: "EDIT",
          //       icon: "r_edit",
          //     },
          //   ],
          // },
          {
            label: "Products",
            key: "M_PRODUCTS",
            langkey: "MANAGE_PRODUCTS",
            icon: "o_qr_code",
            route: { name: "ManageProducts" },
            ignoreItems: true,
            link: "/admin/products",
            items: [
              {
                label: "View",
                key: "M_PRODUCTS_VIEW",
                langkey: "VIEW",
                icon: "r_visibility",
              },
              {
                label: "Edit",
                key: "M_PRODUCTS_EDIT",
                langkey: "EDIT",
                icon: "r_edit",
              },
            ],
          },
          {
            label: "Accounts and Roles",
            key: "AR",
            langkey: "ACCT_ROLES",
            icon: "r_supervised_user_circle",
            route: { name: "Accounts" },
            ignoreItems: true,
            link: "/admin/accounts",
            items: [
              {
                label: "View",
                key: "AR_VIEW",
                langkey: "VIEW",
                icon: "r_visibility",
              },
              {
                label: "Edit",
                key: "AR_EDIT",
                langkey: "EDIT",
                icon: "r_edit",
              },
              {
                label: "Add Roles and Access",
                key: "AR_ADD_ROLES",
                langkey: "ADD_ROLES",
                icon: "r_add",
              },
            ],
          },
          {
            label: "Bulk Uploader",
            key: "BULK",
            langkey: "BULK_UPLOADER",
            icon: "o_drive_folder_upload",
            route: { name: "BulkUpload" },
            ignoreItems: true,
            link: "/admin/bulk",
          },
          {
            label: "System Console",
            key: "SC",
            langkey: "SYS_CONSOLE",
            icon: "o_admin_panel_settings",
            route: { name: "SystemStats" },
            ignoreItems: true,
            link: "/admin/console",
            items: [
              {
                label: "View",
                key: "SC_VIEW",
                langkey: "VIEW",
                icon: "r_visibility",
              },
              {
                label: "Edit",
                key: "SC_EDIT",
                langkey: "EDIT",
                icon: "r_edit",
              }
            ],
          },
        ],
      },     
      // {
      //   label: "System Stats",
      //   key: "STAT",
      //   langkey: "STA",
      //   icon: "o_monitor_heart",
      //   route: { name: "SystemStats" },
      //   ignoreItems: true,
      //   link: "/admin/stat",
      //   roles: [1, 3],
      // },
    ],
    genMenu: [
      // { label: "separator", icon: "", route: {name: 'Dashboard'} },
      {
        label: "Preferences",
        langkey: "PREF",
        icon: "r_style",
        route: { name: "Preferences" },
        link: "main/preferences",
      },
    ],
    sites: [],
    sbu: [
      { label: "Commercial", value: 1 },
      { label: "Defense & Aerospace", value: 2 },
    ],
    businessLine: [],
    productFamily: [
      { label: "Asslar", value: 1 },
      { label: "Boulder", value: 2 },
      { label: "Billerica", value: 3 },
      { label: "Montreal", value: 4 },
    ],
    functions: [
      { label: "Human Resources", value: 1 },
      { label: "General and Admin", value: 2 },
    ],
    dashboards: [],
    loadingDashboard: false,
    userSearch: [],
  }),

  getters: {
    InvalidUser: (state) => {
      console.warn("InvalidUser", state.activeUser, state.activeUser.Sites);  
      return (state.activeUser === null || (state.activeUser && state.activeUser.Sites.length === 0));
    },
    Sites: (state) => {
      return [...state.sites];
    },
    SBU: (state) => {
      return [...state.sbu];
    },
    BusinessLine: (state) => {
      return [...state.businessLine];
    },
    ProductFamily: (state) => {
      return [...state.productFamily];
    },
    Functions: (state) => {
      return [...state.functions];
    },
    Dashboards: (state) => {
      return [...state.dashboards];
    },
    Menu: (state) => {
      var r = [];
      var x = [...state.viewerMenu];
      //const { hasKey } = general();

      // if (state.groupMenu != null) {
      //   if (state.groupMenu.length > 0) {

      //   }
      // }

      for (var h = 0; h < state.viewerMenu.length; h++) {
        var e = { ...state.viewerMenu[h] };

        //console.warn("eval menu", e, e.roles, state.ActiveUser, state.activeUser);

        if (
          //(!state.groupMenu || (state.groupMenu && hasKey(state.groupMenu, e.key))) ||
          //e.always !== undefined ||
          (e.roles === undefined || (state.ActiveUser && e.roles !== undefined && e.roles.indexOf(state.ActiveUser.RoleId) > -1)) //(!state.ActiveUser || !e.roles) || 
          //|| 1 === 1
        ) {
          var a = { ...e };
          if (a.items !== undefined) a.items = [];

          if (e.items !== undefined && e.items.length > 0) {
            for (var i = 0; i < e.items.length; i++) {
              // if (
              //   hasKey(state.groupMenu, e.items[i].key) ||
              //   e.items[i].always !== undefined
              // ) {
              var b = { ...e.items[i] };
              a.items.push(b);
              //}
            }
          }

          r.push(a);
        }
      }

      //override default
      x = [...r];

      //x.push(...state.genMenu);
      return x;
    },
    ManageMenu: (state) => {
      var x = [];

      for (var h = 0; h < state.viewerMenu.length; h++) {
        var e = { ...state.viewerMenu[h] };

        if (e.key !== undefined && e.always === undefined) {
          var a = { ...e };
          if (a.items !== undefined) a.items = [];

          if (e.items !== undefined && e.items.length > 0) {
            for (var i = 0; i < e.items.length; i++) {
              if (
                e.items[i].key !== undefined &&
                e.items[i].always === undefined
              ) {
                var b = { ...e.items[i] };
                a.items.push(b);
              }
            }
          }

          x.push(a);
        }
      }

      return x;
    },
    GroupMenu: (state) => {
      return state.groupMenu;
    },
    ActiveUser: (state) => {
      if (state.activeUser === null) return { Name: "Loading user ..." };
      return state.activeUser;
    },
    IsAdmin: (state) => {
      if (state.activeUser !== null && state.activeUser.AccessRoleID === 1)
        return true;
      return false;
    },
    Role: (state) => {
      console.warn("USER", state, state.activeUser);
      if (
        state.activeUser !== null &&
        state.activeUser.AccessRoleID !== undefined
      )
        return state.activeUser.AccessRoleID;
      return -1;
    },
    HomeFilter: (state) => {
      return state.homefilter;
    },
    LoadingDashboard: (state) => {
      return state.loadingDashboard;
    },
    ADUsers: (state) => {
      return [...state.userSearch];
    },
  },

  actions: {
    async SetUser(payload) {
      if (payload === null) {
        this.activeUser = null;
      } else {
        var _this = this;
        this.activeUser = { ...payload };

        await api.GroupAccess_Menu(payload.GID).then((response) => {
          _this.groupMenu = [...response.data.payload];
        });
      }
    },
    GetCurrentUser() {
      var _this = this;
      return new Promise((resolve) => {
        api
          .GetCurrentUser()
          .then((response) => {
            if (response.data) {
              _this.activeUser = { ...response.data };
              window.sessionStorage.setItem("uid", _this.activeUser.ID);
              _this.GetUserAccessMenu();
            }

            resolve(response.data);
          })
          .catch(() => {
            console.error("Error getting current user");
          });
      });
    },
    SearchUserFromAD(payload) {
      return new Promise((resolve) => {
        lookupApi
          .GetADUsers(payload)
          .then((response) => {
            this.userSearch = [...response.data];
            resolve();
          })
          .catch(() => {
            resolve();
          });
      });
    },
    GetUserAccessMenu() {
      var _this = this;
      return new Promise((resolve) => {
        api
          .GetUserAccessMenu(_this.activeUser.ID)
          .then((response) => {
            _this.groupMenu = [...response.data];
            resolve();
          })
          .catch(() => {
            
          });
      });
    },
    GetUserSites() {
      if (this.activeUser) {
        var _this = this;
        api.GetUserSites(this.activeUser.ID).then((response) => {
          _this.sites = [...response.data];
        });
      }
    },
    GetUserProducts() {
      if (this.activeUser) {
        var _this = this;
        api.GetUserProducts(this.activeUser.ID).then((response) => {
          _this.businessLine = [...response.data];
        });
      }
    },
  },
});
