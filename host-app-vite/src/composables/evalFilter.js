import { computed } from "vue";
import { useOptions } from "../store/options";
import { useUser } from "../store/user";
import { useMainStore } from "../store";

export function useEvalFilter() {
  const mainStore = useMainStore();
  const options = useOptions();
  const user = useUser();

  const optSites = computed(() => {
    if (!user.ActiveUser.ID) return [];

      return [...user.ActiveUser.Sites];
  });

  const optPeriods = computed(() => {
    var x = [];
    console.warn("optPeriods", mainStore.SessionOptions)
      if (!mainStore.SessionOptions.UseOpenPeriod){
        x = mainStore.ReviewPeriods.filter(e => e.IS_ACTIVE === false);
      }else{
        x = mainStore.ReviewPeriods.filter(e => e.IS_ACTIVE === true);
        if (x.length === 0){
          x = mainStore.ReviewPeriods.filter(e => e.LAST_ACTIVE === true);
        }
      }
      
      return x;
  });

  const CustomFilters = computed(() => {
    /**
     * When a custom filter is declared here, also put a registry in the VAR_STORE for tokens will replaced accordingly when composing the dashboard URL
     * Should be unique: label, key, tableRef
     */
    var result = {};

    result["AccountDescription"] = {
      label: "Account",
      type: "select",
      defaultValue: "Sales Total",
      emptyValue: null,
      key: "AccountDescription",
      options: options.SalesTrendAccts,
      alwaysVisible: true,
      //metadata
      tableRef: "HFP_Finance/AccountDescription",
    };

    return result;
  });

  const GetPeriodOpts = (open) => {
    var x = [];

    if (!open){
      x = mainStore.ReviewPeriods.filter(e => e.IS_ACTIVE === false);
    }else{
      x = mainStore.ReviewPeriods.filter(e => e.IS_ACTIVE === true);
        if (x.length === 0){
          x = mainStore.ReviewPeriods.filter(e => e.LAST_ACTIVE === true);
        }
    }

    return x;
  }

  const GetPeriodYears = (open) => {
    var x = [];

    if (!open){
      x = mainStore.ReviewPeriods.filter(e => e.IS_ACTIVE === false);
    }else{
      x = mainStore.ReviewPeriods.filter(e => e.IS_ACTIVE === true);
        if (x.length === 0){
          x = mainStore.ReviewPeriods.filter(e => e.LAST_ACTIVE === true);
        }
    }

    return x;
  }

  const ParseFilterObjects = (data) => {
    var x = [];
    try {
      x = JSON.parse(data);
      if (x === null) x = [];
    } catch {
      //
    }
    return x;
  };

  const SetDefaultSite = () => {
    if (optSites.value.length > 0) {
      var x = {...mainStore.SessionOptions}
      x.Site = optSites.value[0];
      mainStore.SyncSessionOptions(x);
    }
  };

  const SetDefaultPeriod = () => {
    if (optPeriods.value.length > 0){
      var x = {...mainStore.SessionOptions};
      x.Period = optPeriods.value[0];
      mainStore.SyncSessionOptions(x);
    }
  }

  const GetValidSite = () => {
    var result = [];

    if (optSites.value.length > 0) {
      var x = optSites.value.filter(
        (e) => e.label === "Excelitas"
      );

      if (x.length > 0) {
        result = [...x];
      } else {
        result = [...optSites.value[0]]
      }
    }

    return result;
  };

  const IsValidFilter = () => {
    if (mainStore.SessionOptions.Consolidated && mainStore.SessionOptions.Period) return true;
    if (mainStore.SessionOptions.Period && mainStore.SessionOptions.Site) return true;
    return false;
  }

  return {
    optSites,
    optPeriods,
    CustomFilters,
    ParseFilterObjects,
    SetDefaultSite,
    SetDefaultPeriod,
    GetValidSite,
    GetPeriodOpts,
    GetPeriodYears,
    IsValidFilter
  };
}
