<template>
  <q-card flat style="height: 100%">
    <q-toolbar class="q-py-md">
      <q-btn flat round :icon="backicon" @click="context.emit('close')">
        <q-tooltip>{{ GetLocaleString("CLOSE", "Close") }}</q-tooltip>
      </q-btn>
      <q-toolbar-title
        class="app-title text-bold"
        style="overflow: inherit; text-transform: none"
        >{{
          GetLocaleString("NOTIFICATIONS", "Notifications")
        }}</q-toolbar-title
      >
      <q-space />
      <q-btn flat round icon="r_clear_all" @click="notifs.ClearAll()">
        <q-tooltip>{{ GetLocaleString("CLEAR_ALL", "Clear All") }}</q-tooltip>
      </q-btn>
    </q-toolbar>
    <q-card-section class="q-pa-none" style="height: calc(100% - 82px)">
      <div
        v-if="notifs.count === 0"
        class="text-center q-pa-md column no-wrap flex-center"
        style="height: 100%"
      >
        <div>No new notifications</div>
      </div>
      <q-virtual-scroll v-else :items="notifs.items" style="height: 100%">
        <template v-slot="{ item, index }">
          <q-item
            :key="index"
            class="q-card q-ma-sm"
            clickable
            @mouseenter="item.onHover = true"
            @mouseleave="item.onHover = false"
            style="min-height: 100px; background: transparent"
          >
            <q-item-section avatar top>
              <q-avatar>
                <q-icon
                  :name="item.icon === null ? 'r_info' : item.icon"
                  size="lg"
                  :color="
                    item.iconcolor === undefined ? 'primary' : item.iconcolor
                  "
                />
              </q-avatar>
            </q-item-section>
            <q-item-section
              style="justify-content: flex-start; padding-top: 4px"
            >
              <q-item-label v-if="item.title" class="text-bold" style="font-size:1.1em !important">{{
                item.title
              }}</q-item-label>
              <q-item-label
                v-html="
                  `${
                    item.expand
                      ? `${item.message}`
                      : `${item.message.substring(0, 100)}`
                  }${item.message.length > 100 ? '...' : ''}`
                "
              ></q-item-label>
              <!-- <q-item-label caption>{{
                moment(moment.utc(item.timestamp))
                  .local()
                  .format("YYYY-MM-DD HH:mm:ss")
              }}</q-item-label> -->
              <q-item-label caption>{{item.timestamp}}</q-item-label>
            </q-item-section>
            <q-item-section side style="min-width: 44px">
              <q-btn
                v-if="item.onHover || item.onHover === undefined"
                flat
                round
                icon="r_close"
                size="sm"
                @click="notifs.Remove(i)"
              />
              <q-btn
                v-if="
                  (item.onHover || q.platform.has.touch) &&
                  item.message.length >= 50
                "
                flat
                round
                :icon="item.expand ? 'r_expand_less' : 'r_expand_more'"
                size="sm"
                @click="item.expand = !item.expand"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-virtual-scroll>
    </q-card-section>
  </q-card>
</template>

<style scoped>
</style>

<script>
import { inject, onBeforeUnmount, onMounted } from "vue";
import { useNotifs } from "../../store/notifs";
import { useQuasar } from "quasar";
import moment from "moment";

export default {
  name: "Notifications",
  // components: {
  //   ProfileAvatar: defineAsyncComponent(() => import("../General/ProfileAvatar.vue"))
  // },
  props: {
    backicon: {
      type: String,
      default: "r_arrow_back",
    },
  },
  emits: ["close"],
  setup(props, context) {
    const q = useQuasar();
    const notifs = useNotifs();
    const mobileView = inject("mobileView");
    const GetLocaleString = inject("GetLocaleString");

    onMounted(() => {
      //
    });

    onBeforeUnmount(() => {
      //
    });

    return {
      q,
      notifs,
      GetLocaleString,
      mobileView,
      context,
      moment,
    };
  },
};
</script>
