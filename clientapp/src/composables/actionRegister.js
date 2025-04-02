import { nextTick, ref, watch } from "vue";
import { useMainStore } from "@/store/index";
import api from "@/api/actionRegister";
import { useUser } from "../store/user";
import { useHelper } from "./helper";
import general from "@/mixins/general";
//import axios from "axios";

export default function useActionRegister(_opts) {
  const { ConfirmAction, NotifyUser } =
    general();
  const mainStore = useMainStore();
  const user = useUser();
  const loading = ref(false);
  const items = ref([]);
  const category = ref(null);
  const action_options = ref([
    { value: "NOT_COMPLETED", label: "Not Yet Completed", color: "red" },
    { value: "IN_PROGRESS", label: "In Progress", color: "yellow" },
    { value: "COMPLETED", label: "Completed", color: "green" },
  ]);
  const { renderKey, UpRender } = useHelper();
  //const cancelToken = ref(null);

  watch(
    items,
    () => {
      console.warn("items changed", items.value);
      UpRender();
    },
    { deep: true }
  );

  const GetActionRegisters = (_category) => {
    category.value = _category;
    items.value = [];
    nextTick(() => {
      var opts = {
        Category: _category,
        Consolidated: mainStore.SessionOptions.Consolidated,
        PeriodId: mainStore.SessionOptions.Period.PERIOD_ID,
        SiteId: mainStore.SessionOptions.Site.SiteId,
      };
      api.GetAR(opts).then((response) => {
        items.value = [...response.data];
        items.value.map((e) => (e.dirty = false));
        UpRender();
      });
    });
  };

  const Add = (category, assigned) => {
    var x = {
      Message: null,
      Submitter: user.ActiveUser.ID,
      Id: 0,
      Metadata: {
        Category: category,
        Email: assigned.Email,
        DisplayName: assigned.DisplayName,
        Title: assigned.Title,
        Status: "NOT_COMPLETED",
        Consolidated: mainStore.SessionOptions.Consolidated,
        PeriodId: mainStore.SessionOptions.Period.PERIOD_ID,
        SiteId: mainStore.SessionOptions.Site.SiteId,
        PeriodName: mainStore.SessionOptions.Period.DESCRIPTION,
        SiteName: mainStore.SessionOptions.Site.SiteName
      },
    };

    items.value.push(x);
  };

  const SaveItem = (data, index) => {
    console.warn("save data", data, index);
    var x = {...data}
    x.Session = mainStore.SessionOptions;
    x.opts = _opts;

    api.Save(x).then((response) => {
      console.warn(response.data);
      NotifyUser(response.data);
      if (response.data.success){
        GetActionRegisters(category.value);
      }      
    });
  };

  const RefreshItem = () => {
    GetActionRegisters(category.value);
  };

  const DeleteItem = (data) => {
    ConfirmAction("Are you sure you want to delete this item?", () => {
      console.log(data);
      api.Delete(data.Id).then(response => {
        NotifyUser(response.data);
        if (response.data.success){
          GetActionRegisters(category.value);
        }
      })
    });
  };

  return {
    loading,
    items,
    GetActionRegisters,
    Add,
    SaveItem,
    RefreshItem,
    DeleteItem,
    action_options,
    renderKey,
    UpRender,
  };
}
