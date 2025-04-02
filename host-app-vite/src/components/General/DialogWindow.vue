<template>
  <QDialog :maximized="maximized" v-model="dialog" :position="position">
    <QCard class="no-scroll board-bg-color">
      <QCardSection class="q-pa-none main-header">
        <QToolbar>
          <QBtn
            v-if="maximized"
            flat
            dense
            round
            aria-label="Menu"
            icon="r_arrow_back"
            @click="dialog = false"
          />
          <QToolbarTitle class="app-title"
            >{{ title}}</QToolbarTitle
          >
          <QBtn
            v-if="!maximized"
            flat
            dense
            round
            aria-label="Menu"
            icon="r_close"
            @click="dialog = false"
          />
        </QToolbar>
        <QToolbar class="extended-header" />
      </QCardSection>

      <Board>
        <slot></slot>
      </Board>
    </QCard>
  </QDialog>
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
