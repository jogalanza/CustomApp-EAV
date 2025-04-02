import { useUser } from "../store/user";
import { inject, watch } from "vue";
import { useMainStore } from "../store";

export function useDashboard() {
  const mainStore = useMainStore();
  const user = useUser();
  const HubSend = inject("HubSend");
  const HubConnected = inject("HubConnected");

  watch(
    () => HubConnected,
    () => {
      SetDashboardIn();
    }
  );

  const SetDashboardIn = () => {
    if (user.ActiveUser.ID !== undefined && HubConnected.value) {
      var _payload = {
        User: {
          ID: user.ActiveUser.ID,
        },
        Dashboard: {
          ID: mainStore.ActiveDashboard.ID,
        },
      };
      HubSend({ method: "dashboard-in", payload: JSON.stringify(_payload) });
    }
  };
 

  return {
    SetDashboardIn
  };
}
