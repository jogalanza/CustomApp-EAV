import { ref  } from "vue";
import { useQuasar } from 'quasar'

export default function useServerEvents() {
  const notif = ref(null);
  const q = useQuasar();
  const isNotifActive = ref(false);

  const InvokeNotif = (data) => {
    //console.warn("notif", data, notif.value)

    // if (isNotifActive.value) {
    //   return;
    // }

    // isNotifActive.value = true;

    var a = JSON.parse(data);
    var x = {
      icon: a.icon || null,
      position: "bottom-left",
      group: false, // required to be updatable
      timeout: a.timeout || 0, // we want to be in control when it gets dismissed
      spinner: !a.icon,
      message: a?.message || "Busy",
      caption: a?.caption || "Please wait"
    }

    if (!notif.value){
      notif.value = q.notify(x);
      
    }else{
      const _notif = notif.value;
      _notif(x);

      if (a.timeout){
        setTimeout(() => {
          notif.value();
          console.warn("nivoke notify", notif.value);
          notif.value = null;
          isNotifActive.value = false;
        }, a.timeout)
      }
    }
  }

  return {
    notif,
    InvokeNotif
  };
}
