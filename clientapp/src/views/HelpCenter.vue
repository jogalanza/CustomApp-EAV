<template>
  <BoardLayout
    :loading="loading"
    :drawer="drawerRight"
    :breakpoint="20000"
    :show-if-above="false"
    :drawer-width="q.screen.width < 450 ? q.screen.width : 450"
    @drawerchange="(e) => (drawerRight = e)"
  >
    <q-card class="absolute" flat style="height: 100%; width: 100%">
      <q-card-section
        :class="`${mobileView ? 'q-pa-none' : 'q-pt-none'}`"
        style="height: 100%"
      >
        <q-toolbar
          class="q-px-none"
          :style="`${mobileView ? 'padding-bottom: 0px;padding-top:0px' : ''}`"
        >
          <q-toolbar-title :class="`app-title in-board clip`">
            {{ GetLocaleString("HELP_CENTER", "Help Center") }}
          </q-toolbar-title>
          <q-space />
        </q-toolbar>

        <q-carousel
          ref="carousel"
          v-model="slide"
          transition-prev="jump-right"
          transition-next="jump-left"
          swipeable
          animated
          control-color="green"
          prev-icon="r_navigate_before"
          next-icon="r_navigate_next"
          padding
          infinite
          keep-alive
          class="report-carousel rounded-borders"
          style="height: calc(100% - 70px)"
        >
          <q-carousel-slide
            name="main"
            class="row q-pa-none"
            style="align-content: flex-start"
          >
            <q-tabs v-model="tab" no-caps align="left" style="width: 100%">
              <q-tab name="trainings" label="Trainings" />
              <q-tab name="faqs" label="Frequently Asked Questions" />
            </q-tabs>

            <q-tab-panels
              v-model="tab"
              keep-alive
              style="width: 100%; height: calc(100% - 48px - 20px)"
            >
              <q-tab-panel name="trainings">
                <div class="row justify-center">
                  <div class="col-11">
                    <div v-if="cms.Trainings.length > 0" class="row">
                      <div
                        v-for="(m, i) in cms.Trainings"
                        :key="i"
                        class="col-12 col-sm-6 col-md-3 q-pa-sm"
                      >
                        <q-card class="info-card" @click="ViewTraining(m)">
                          <q-img
                            v-if="m.attributes.logo.data"
                            :src="`${cmsUrl}${m.attributes.logo.data.attributes.formats.thumbnail.url.substring(
                              1
                            )}`"
                          >
                            <template v-slot:error>
                              <q-img :src="require('@/assets/people.jpg')" />
                            </template>
                          </q-img>
                          <q-img v-else :src="require('@/assets/people.jpg')" />
                          <span
                            v-if="m.attributes.featured === true"
                            class="featured q-pa-sm absolute bg-red text-white"
                            style="left: 0px"
                            >Featured</span
                          >
                          <q-card-section class="title q-py-sm">{{
                            m.attributes.title
                          }}</q-card-section>
                          <q-card-section class="description q-pt-none"
                            ><p>{{ m.attributes.details }}</p></q-card-section
                          >
                        </q-card>
                      </div>
                    </div>
                    <div v-else class="text-center text-h6 q-pa-lg">
                      <q-avatar size="140px">
                        <img
                          :src="require('@/assets/people.jpg')"
                          :width="140"
                          class="q-pa-md rounded-borders"
                        />
                      </q-avatar>

                      <p>No published trainings yet. Please try again later.</p>
                    </div>
                  </div>
                </div>
              </q-tab-panel>

              <q-tab-panel name="faqs">
                <div class="row justify-center q-pt-lg">
                  <div class="col-11 col-sm-8">
                    <q-list v-if="cms.FAQS.length > 0">
                      <q-expansion-item popup
                        v-for="(m, i) in cms.FAQS"
                        :key="i"
                        expand-separator
                      >
                        <template v-slot:header>
                          <q-item-section avatar>
                            <q-avatar>
                              <img :src="require('@/assets/question.jpg')" />
                            </q-avatar>
                          </q-item-section>

                          <q-item-section
                            class="text-h5"
                            style="font-size: 1.4em"
                          >
                            {{ m.attributes.question }}
                          </q-item-section>
                        </template>

                        <q-card>
                          <q-card-section>
                            {{ m.attributes.answer }}
                          </q-card-section>
                        </q-card>
                      </q-expansion-item>
                    </q-list>
                    <div v-else class="text-center text-h6 q-pa-lg">
                      <q-avatar size="140px">
                        <img
                          :src="require('@/assets/question.jpg')"
                          :width="140"
                          class="q-pa-md rounded-borders"
                        />
                      </q-avatar>

                      <p>No published FAQs yet. Please try again later.</p>
                    </div>
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-carousel-slide>

          <q-carousel-slide
            name="training"
            class="row q-pa-none"
            style="align-content: flex-start"
          >
            <q-toolbar>
              <q-btn
                icon="o_arrow_back"
                flat
                round
                @click="slide = 'main'"
              ></q-btn>
              <q-toolbar-title>{{
                activeTraining.attributes.title
              }}</q-toolbar-title>
              <q-space />
              <q-btn
                :label="
                  activeTraining.textmode
                    ? 'View Attachments'
                    : 'View Text Content'
                "
                flat
                no-caps
                @click="activeTraining.textmode = !activeTraining.textmode"
              />
              <q-btn
                label="Download Files"
                flat
                icon="o_file_download"
                no-caps
                @click="DownloadTrainingDocs"
                class="q-ml-sm"
              />
            </q-toolbar>
            <q-card flat style="width: 100%; height: calc(100% - 50px)">
              <!-- <q-card-section>{{ activeTraining.attributes.details }}</q-card-section> -->
              <q-card-section
                v-if="activePDF !== '' && !activeTraining.textmode"
                class="q-pa-none"
                style="height: calc(100% - 2px)"
              >
                <embed
                  :src="activePDF"
                  type="application/pdf"
                  frameBorder="0"
                  scrolling="auto"
                  height="100%"
                  width="100%"
                />
              </q-card-section>
              <q-card-section
                v-else-if="
                  activeTraining.attributes.attachments &&
                  activeTraining.attributes.attachments.data.length > 0 &&
                  !activeTraining.textmode
                "
                class="q-pa-none"
                style="height: calc(100% - 2px)"
              >
                <div class="row justify-center">
                  <div class="col-11">
                    <div class="row">
                      <div
                        v-for="(m, i) in activeTraining.attributes.attachments
                          .data"
                        :key="i"
                        class="col-12 col-sm-4 col-md-3 q-pa-sm"
                      >
                        <q-card
                          class="info-card"
                          @click="Download(m.attributes.url.substring(1))"
                        >
                          <q-img :src="require('@/assets/folder.jpg')" />
                          <q-card-section class="title q-py-sm">{{
                            m.attributes.name
                          }}</q-card-section>
                        </q-card>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
              <q-card-section
                v-else
                class="q-pa-none"
                style="height: calc(100% - 2px); overflow: auto"
              >
                <div v-html="activeTraining.attributes.details"></div
              ></q-card-section>
            </q-card>
          </q-carousel-slide>
        </q-carousel>
      </q-card-section>
    </q-card>
  </BoardLayout>
</template>

<style scoped lang="scss">
.info-card {
  cursor: pointer;
  margin-top: 12px;
  .featured {
    top: 12px;
    left: 0px;
  }

  &:hover {
    transform: scale(1.05);
    z-index: 100;
    background: #31ccec;

    // .featured {
    //   // transform: scale(1.1) translate(3px, 20px);
    //   top: 38px;
    // }

    .title,
    .description {
      color: white;
    }
  }

  .title {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-weight: bold;
  }
  .description {
    height: 75px;

    p {
      height: 100%;
      overflow: hidden;
      /* white-space: pre-line; */
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
  }
}
</style>

<script>
import {
  defineAsyncComponent,
  ref,
  inject,
  computed,
  onBeforeUnmount,
  watch,
  onMounted,
} from "vue";

import general from "@/mixins/general";
import { useUser } from "@/store/user";
import { useMainStore } from "@/store/index";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";
import { useCMS } from "../store/cms";

export default {
  name: "HelpCenter",
  components: {
    BoardLayout: defineAsyncComponent(() =>
      import("../components/General/BoardLayout.vue")
    ),
    // ProfileAvatar: defineAsyncComponent(() =>
    //   import("../components/General/ProfileAvatar.vue")
    // ),
    // FilterBar: defineAsyncComponent(() =>
    //   import("../../components/General/FilterBar.vue")
    // ),
  },
  setup() {
    const q = useQuasar();
    const user = useUser();
    const route = useRoute();
    const cms = useCMS();
    const mainStore = useMainStore();
    const { navigateTo } = general();
    const panel = ref("settings");
    const slide = ref("main");

    const tab = ref("trainings");
    const activeTraining = ref({});

    const drawerRight = ref(false);

    const collapseMenu = computed(() => {
      return q.screen.width < 700;
    });

    const IsMenuOK = inject("IsMenuOK");

    const GetLocaleString = inject("GetLocaleString");

    const cmsUrl = computed(() => {
      return window.xmap.cms ? `${window.xmap.cms}` : `http://localhost:1339`;
    });

    const activePDF = computed(() => {
      if (activeTraining.value.id) {
        if (
          activeTraining.value.attributes.attachments &&
          activeTraining.value.attributes.attachments.data.length > 0
        ) {
          var docs = [...activeTraining.value.attributes.attachments.data];
          var f = false;
          var _pdf = "";
          for (let index = 0; index < docs.length; index++) {
            const element = docs[index];
            if (!f) {
              if (element.attributes.mime === "application/pdf") {
                _pdf = `${
                  window.xmap.cms
                    ? `${window.xmap.cms}`
                    : `http://localhost:1339`
                }${element.attributes.url.substring(1)}`;
                f = true;
              }
            }
          }

          return _pdf;
        }
      }
      return "";
    });

    watch(
      () => route.query.tab,
      (newVal) => {
        if (newVal) {
          tab.value = newVal;
        }
      },
      { deep: true }
    );

    const SwitchPanel = (data) => {
      drawerRight.value = true;
      panel.value = data;
    };

    const ViewTraining = (_data) => {
      activeTraining.value = { ..._data };
      slide.value = "training";
    };

    const DownloadTrainingDocs = () => {
      if (
        activeTraining.value.attributes.attachments &&
        activeTraining.value.attributes.attachments.data.length > 0
      ) {
        var docs = [...activeTraining.value.attributes.attachments.data];
        for (let index = 0; index < docs.length; index++) {
          const element = docs[index];
          window.open(
            `${
              window.xmap.cms ? `${window.xmap.cms}` : `http://localhost:1339`
            }${element.attributes.url.substring(1)}`,
            "_blank"
          );
        }
      }
    };

    const Download = (path) => {
      window.open(
        `${
          window.xmap.cms ? `${window.xmap.cms}` : `http://localhost:1339`
        }${path}`,
        "_blank"
      );
    };

    onMounted(() => {
      if (route.query.tab) {
        tab.value = route.query.tab;
      }

      cms.GetTrainings();
      cms.GetFAQS();
    });

    onBeforeUnmount(() => {
      //
    });

    return {
      tab,
      q,
      slide,
      user,
      drawerRight,
      navigateTo,
      collapseMenu,
      GetLocaleString,
      IsMenuOK,
      panel,
      SwitchPanel,
      mainStore,
      cms,
      activeTraining,
      ViewTraining,
      activePDF,
      DownloadTrainingDocs,
      Download,
      cmsUrl,
    };
  },
};
</script>
