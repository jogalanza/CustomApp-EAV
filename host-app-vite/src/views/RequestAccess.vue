<template>
  <QCard class="login-page flex flex-center" :style="`background: url('${require('../assets/etc2.png')}'); background-position-y: -72%`">
    <QCardSection :class="{ container: true, maximized: mobile }">
      <QCard :class="{ 'request-card text-white': true, maximized: mobile }">
        <QCardSection class="upper-section text-center q-pt-lg q-pb-none col-6">
          <QImg :src="require('../assets/excelitas_logo.png')" width="180px" style="margin-top: 32px; margin-bottom: 16px;" />
          <div class="q-py-lg text-h4" style="text-transform: uppercase; font-size: 4em; font-family: 'sap72-bold'; letter-spacing: -4px;">
            {{ GetLocaleString("XMAP_DASHBOARD", "XMAP") }}
          </div>
        </QCardSection>

        <QCardSection class="lower-section col-6 row">
          <div v-if="email" class="col-12 q-mb-md" style="font-size: 1.2em" v-html="`The email <b>${email}</b> is not registered in the system.`">
          </div>
          <div class="col-12 q-mb-md" style="font-size: 1.2em">
            You need permission to access this site. Please create an Access
            Request in Fresh Service (IT Service Desk) in order to gain access
            to this application.
          </div>
          <div v-if="responseMsg" class="col-12 q-mb-md">
            {{ responseMsg }}
          </div>
          <div class="col-6 q-mb-md q-px-sm">
            <QBtn class="full-width" no-caps :label="loading
                ? `${GetLocaleString('PROCESSING', 'Processing...')}`
                : `${GetLocaleString(
                  'REQUEST_ACCESS',
                  'Create Access Request'
                )}`
              " color="green" size="md" @click="SendAccessRequest" :disable="loading" />
          </div>
          <div class="col-6 q-mb-md q-px-sm">
            <QBtn class="full-width" no-caps label="Try again" color="green" size="md" @click="Reload" />
          </div>
        </QCardSection>

        <!-- <QSeparator dark class="q-mx-md" />

        <QCardSection class="text-center q-pa-lg col-12" style="font-size: 0.8em">
          <div>All Rights Reserved</div>
        </QCardSection> -->
      </QCard>
    </QCardSection>
  </QCard>
</template>

<style scoped lang="scss">
.pw-warning {
  padding: 8px;
  padding-left: 16px;
  font-size: 0.8rem;
  color: yellow;
}

.login-page {
  height: 100vh;
  background-size: inherit !important;
}

.request-card {
  width: 600px;
  background: #222;
  box-shadow: 0px 0px 7px #32584c;
  margin-top: -370px;

  // mods
  background: transparent;
  box-shadow: 0px 10px 16px rgb(0 0 0 / 70%);

  &.maximized {
    margin-top: 0px;
    // box-shadow: none;
  }

  .upper-section {
    background: rgba(0, 0, 0, 0.75);
    border-top: 1px solid #666;
    // border-bottom: 1px solid #666;
    // background: transparent;
    padding: 16px;
  }

  .lower-section {
    // margin-top: 131px;
    background: #111;
    padding: 24px;
  }

  .q-carousel {
    height: 440px;
  }
}

.maximized {
  width: 100%;
  height: 100%;
}

@media (max-width: 425px) {
  .request-card {
    width: 100%;
    height: 100%;
  }
}
</style>

<style lang="scss">
.login-page {
  .login-carousel {
    .q-carousel__slides-container {
      height: calc(100% - 60px);
    }
  }

  .q-tab__indicator {
    background: transparent !important;
  }

  .tab-indicator {
    border-radius: 50%;
    min-height: 16px;
    height: 16px;
    width: 16px;

    .q-focus-helper {
      display: none;
    }

    .q-tab__content {
      min-width: 16px !important;
    }

    .content {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgb(150, 146, 146);
    }
  }
}
</style>

<script>
import { onMounted, ref, computed, inject } from "vue";
import { useQuasar } from "quasar";
import server from "../server";

export default {
  name: "RequestAccess",
  components: {},
  setup() {
    var x = window.sessionStorage.getItem("email");
    const email = ref(x);
    const q = useQuasar();
    const loading = ref(false);
    const message = ref(null);
    const responseMsg = ref(null);

    const mobile = computed(() => q.screen.width < 600);

    const GetLocaleString = inject("GetLocaleString");

    const SendAccessRequest = () => {
      window.open(
        "https://excelitas.freshservice.com/a/catalog/request-items/78"
      );
    };

    const Reload = () => {
      window.location.href = `${server.defaults.baseURL}`
    };

    onMounted(() => {
      //
    });

    return {
      email,
      mobile,
      loading,
      responseMsg,
      message,
      SendAccessRequest,
      Reload,
      GetLocaleString,
    };
  },
};
</script>
