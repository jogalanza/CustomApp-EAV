<template>
  <Board>
    <q-layout
      :view="view"
      container
      class="inner-board-layout"
      ref="boardlayout"
    >
      <!-- lhh LpR lff -->
      <q-header class="inner-board-header">
        <q-linear-progress indeterminate v-show="loading" color="green" />
        <slot name="header"> </slot>
      </q-header>

      <q-drawer
        side="right"
        v-model="drawerRight"
        :width="drawerWidth"
        :breakpoint="breakpoint"
        :show-if-above="showIfAbove"
        class="inner-drawer"
        bordered
      >
        <slot name="right-drawer"> </slot>
      </q-drawer>

      <q-page-container style="height: 100%">
        <q-page class="q-pa-none" style="height:100%">
          <slot name="default"> </slot>
        </q-page>
      </q-page-container>
    </q-layout>
  </Board>
</template>

<style scoped></style>

<script>
import { defineAsyncComponent, defineComponent, onMounted, provide, ref, watch } from "vue";

export default defineComponent({
  name: "BoardLayout",
  components: {
    Board: defineAsyncComponent(() => import("./Board.vue")),
  },
  emits: ["drawerchange", "hide"],
  props: {
    view: {
      type: String,
      default: "hHh lpR fFf"
    },
    loading: {
      type: Boolean,
      default: false,
    },
    drawer: {
      type: Boolean,
      default: false,
    },
    showIfAbove: {
      type: Boolean,
      default: false,
    },
    breakpoint: {
      type: Number,
      default: 1024,
    },
    drawerWidth: {
      type: Number,
      default: 450,
    },
  },
  setup(props, context) {
    const drawerRight = ref(false);
    const boardlayout = ref(null);

    watch(
      () => props.drawer,
      () => {
        drawerRight.value = props.drawer;
      },
      { immediate: true }
    );

    watch(
      drawerRight,
      () => {
        context.emit("drawerchange", drawerRight.value);
      },
      { immediate: true }
    );

    onMounted(() => {
      provide("BoardLayout", boardlayout);
    });

    return {
      drawerRight,
      boardlayout,
    };
  },
});
</script>
