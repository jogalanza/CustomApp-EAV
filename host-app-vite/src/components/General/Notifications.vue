<template>
  <QCard flat style="height: 100%">
    <QToolbar class="q-py-md">
      <QBtn flat round :icon="backicon" @click="context.emit('close')">
        <QTooltip>{{ GetLocaleString("CLOSE", "Close") }}</QTooltip>
      </QBtn>
      <QToolbarTitle
        class="app-title text-bold"
        style="overflow: inherit; text-transform: none"
        >{{
          GetLocaleString("NOTIFICATIONS", "Notifications")
        }}</QToolbarTitle
      >
      <QSpace />
      <QBtn flat round icon="r_clear_all" @click="notifs.ClearAll()">
        <QTooltip>{{ GetLocaleString("CLEAR_ALL", "Clear All") }}</QTooltip>
      </QBtn>
    </QToolbar>
    <QCardSection class="q-pa-none" style="height: calc(100% - 82px)">
      <div
        v-if="notifs.count === 0"
        class="text-center q-pa-md column no-wrap flex-center"
        style="height: 100%"
      >
        <div>No new notifications</div>
      </div>
      <q-virtual-scroll v-else :items="notifs.items" style="height: 100%">
        <template v-slot="{ item, index }">
          <QItem
            :key="index"
            class="QCard q-ma-sm"
            clickable
            @mouseenter="item.onHover = true"
            @mouseleave="item.onHover = false"
            style="min-height: 100px; background: transparent"
          >
            <QItemSection avatar top>
              <QAvatar>
                <QIcon
                  :name="item.icon === null ? 'r_info' : item.icon"
                  size="lg"
                  :color="
                    item.iconcolor === undefined ? 'primary' : item.iconcolor
                  "
                />
              </QAvatar>
            </QItemSection>
            <QItemSection
              style="justify-content: flex-start; padding-top: 4px"
            >
              <QItemLabel v-if="item.title" class="text-bold" style="font-size:1.1em !important">{{
                item.title
              }}</QItemLabel>
              <QItemLabel
                v-html="
                  `${
                    item.expand
                      ? `${item.message}`
                      : `${item.message.substring(0, 100)}`
                  }${item.message.length > 100 ? '...' : ''}`
                "
              ></QItemLabel>
              <!-- <QItemLabel caption>{{
                moment(moment.utc(item.timestamp))
                  .local()
                  .format("YYYY-MM-DD HH:mm:ss")
              }}</QItemLabel> -->
              <QItemLabel caption>{{item.timestamp}}</QItemLabel>
            </QItemSection>
            <QItemSection side style="min-width: 44px">
              <QBtn
                v-if="item.onHover || item.onHover === undefined"
                flat
                round
                icon="r_close"
                size="sm"
                @click="notifs.Remove(i)"
              />
              <QBtn
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
            </QItemSection>
          </QItem>
        </template>
      </q-virtual-scroll>
    </QCardSection>
  </QCard>
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
