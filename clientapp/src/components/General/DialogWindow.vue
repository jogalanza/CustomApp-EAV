<template>
  <q-dialog :maximized="maximized" v-model="dialog" :position="position">
    <q-card class="no-scroll board-bg-color">
      <q-card-section class="q-pa-none main-header">
        <q-toolbar>
          <q-btn
            v-if="maximized"
            flat
            dense
            round
            aria-label="Menu"
            icon="r_arrow_back"
            @click="dialog = false"
          />
          <q-toolbar-title class="app-title"
            >{{ title}}</q-toolbar-title
          >
          <q-btn
            v-if="!maximized"
            flat
            dense
            round
            aria-label="Menu"
            icon="r_close"
            @click="dialog = false"
          />
        </q-toolbar>
        <q-toolbar class="extended-header" />
      </q-card-section>

      <Board>
        <slot></slot>
      </Board>
    </q-card>
  </q-dialog>
</template>

<style scoped>

</style>

<script>
import { ref, computed, defineAsyncComponent } from "vue";
import { useQuasar } from 'quasar'

export default {
  name: "DialogWindow",
  props: {
    title: {
      type: String,
      default: 'Dialog Window'
    },
    initMax: {
      type: Boolean,
      default: true
    },
    position: {
      type: String,
      default: 'standard'
    }
  },
  components:{
    Board: defineAsyncComponent(() => import('./Board.vue'))
  },
  emits: ['refresh'],
  setup(props) {
    const q = useQuasar()
    const dialog = ref(false);

    const maximized = computed(() => {
      if (q.screen.width > 1024 && !props.initMax) return false
      return true;
    })

    const Show = () => {
      dialog.value = true
    }

    const Hide = () => {
      dialog.value = false
    }



    return {  
      maximized,   
      dialog, 
      Show,
      Hide    
    };
  },
  mounted() {
  },
};
</script>
