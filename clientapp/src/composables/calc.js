// import { useUser } from "@/store/user";
// import { inject, watch } from "vue";
import { useMainStore } from "../store";

export function useCalc() {
  const mainStore = useMainStore();
  // const user = useUser();
  // const HubSend = inject("HubSend");
  // const HubConnected = inject("HubConnected");

  const CalcGridData = (current, history, offset, pointer, key, callback, subkey, lineNumber) => {
    var x = "-";
    if (offset === 2 && pointer === 10){
      //current
      if (current[key] !== undefined){
        if (callback !== undefined){
            x = callback(current)
          }else{
            //TODO: Format output
            if (subkey !== undefined && lineNumber !== undefined && current[subkey][lineNumber][key] !== undefined){
              x = current[subkey][lineNumber][key];
            }else{
              x = current[key];
            }
          }
      }
    }else{
      //history  
      var xx = history[offset + pointer].model[key];
      if (subkey !== undefined && lineNumber !== undefined && history[offset + pointer].model[subkey][lineNumber][key] !== undefined){
        xx = history[offset + pointer].model[subkey][lineNumber][key];
      }    

      if (history[offset + pointer] !== undefined && xx !== undefined){        
        if (callback !== undefined){
          x = callback(history[offset + pointer].model)
        }else{
          //TODO: Format output
          
          x = xx; //history[offset + pointer].model[key];
        }
      }
    }
    
    return x;
  }

  const CalcGridPeriodHeader = (offset, pointer) => {
    var x = "-";
    if (mainStore.LTMPeriods.length + 1 > (offset + pointer)){
      x = mainStore.LTMPeriods[offset + pointer].Description;
    }

    return x;
  }

 

  return {
    CalcGridData,
    CalcGridPeriodHeader
  };
}
