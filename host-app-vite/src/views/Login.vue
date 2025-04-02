<template>
  <QCard
    class="login-page flex flex-center"
    style="background: url('images/etc-bg-2.png')"
  >
    <QCardSection :class="{ maximized: mobile }">
      <QCard :class="{ 'login-card text-white': true, maximized: mobile }">
        <QCardSection class="text-center q-pt-lg q-pb-none">
          <QImg src="images/excelitas_logo.png" width="180px" />
          <div class="q-py-lg text-h6">
            {{ GetLocaleString("XMAP", "XMAP") }}
          </div>
        </QCardSection>

        <!-- FORGOT PASSWORD -->
        <QCardSection v-if="mode === 2 && showUI" class="row">
          <div class="col-12 q-mb-sm">
            <q-input
              v-model="resetCreds.cardNo"
              autocomplete="off"
              dark
              filled
              label="Card No"
              label-color="white"
              dense
              clearable
              :disable="loading"
            />
          </div>
          <div class="col-12 q-mb-sm">
            <q-input
              v-model="resetCreds.pass1"
              dark
              dense
              filled
              label="New Password"
              type="password"
              label-color="white"
              clearable
              :disable="loading"
            />
          </div>

          <div class="col-12 q-mb-sm">
            <q-input
              v-model="resetCreds.pass2"
              dark
              dense
              filled
              label="Confirm New Password"
              type="password"
              label-color="white"
              clearable
              :disable="loading"
            />
          </div>

          <div v-if="!AllowPWReset()" class="col-12 q-mb-sm">
            <ul class="pw-warning">
              <li v-if="!pwMinChars(resetCreds.pass1)">
                Password should be at least 8 characters long.
              </li>
              <li v-if="!pwUppercase(resetCreds.pass1)">
                Must have at least one uppercase letter
              </li>
              <li v-if="!pwLowercase(resetCreds.pass1)">
                Must have at least one lowercase letter
              </li>
              <li v-if="!pwHasDigit(resetCreds.pass1)">
                Must have at least one digit
              </li>
              <li v-if="!pwMatch(resetCreds.pass1, resetCreds.pass2)">
                Password should match
              </li>
            </ul>
          </div>

          <div class="col-12 q-my-md">
            <QBtn
              class="full-width"
              :label="
                loading ? 'Processing Request...' : 'Request Password Reset'
              "
              color="green"
              size="md"
              :disable="loading || !AllowPWReset()"
              @click="ResetPassword"
            />
          </div>
          <div class="col-12 q-my-md">
            <QBtn
              class="full-width"
              label="Already have an account? Log in"
              size="md"
              flat
              :disable="loading"
              text-color="grey"
              no-caps
              @click="SwitchMode(1)"
            />
          </div>
        </QCardSection>

        <!-- SIGN UP -->
        <QCardSection v-else-if="mode === 3 && showUI" class="row">
          <QList class="full-width" style="max-height: 440px;overflow-y:auto">
            <QItemLabel class="text-h5 text-center q-pb-md">Sign Up</QItemLabel>
            <QItem class="q-px-none">
              <QItemSection>
                <q-input
                  v-model="signUp.cardNo"
                  autocomplete="off"
                  dark
                  filled
                  label="Card No"
                  label-color="white"
                  dense
                  clearable
                  :disable="loading"
                />
              </QItemSection>
            </QItem>
            <QItem class="q-px-none">
              <QItemSection>
                <q-input
                  v-model="signUp.email"
                  autocomplete="off"
                  dark
                  filled
                  label="Email"
                  label-color="white"
                  dense
                  clearable
                  :disable="loading"
                />
              </QItemSection>
            </QItem>
            <QItem class="q-px-none">
              <QItemSection>
                <q-input
                  v-model="signUp.firstname"
                  autocomplete="off"
                  dark
                  filled
                  label="First Name"
                  label-color="white"
                  dense
                  clearable
                  :disable="loading"
                />
              </QItemSection>
            </QItem>
            <QItem class="q-px-none">
              <QItemSection>
                <q-input
                  v-model="signUp.lastname"
                  autocomplete="off"
                  dark
                  filled
                  label="Last Name"
                  label-color="white"
                  dense
                  clearable
                  :disable="loading"
                />
              </QItemSection>
            </QItem>
            <QItem class="q-px-none">
              <QItemSection>
                <q-select
                  v-model="signUp.approvingManager"
                  autocomplete="off"
                  dark
                  filled
                  label="Approving Manager"
                  label-color="white"
                  dense
                  clearable
                  :disable="loading"
                />
              </QItemSection>
            </QItem>
            <QItem class="q-px-none">
              <QItemSection>
                <q-input
                  v-model="signUp.pass1"
                  dark
                  dense
                  filled
                  label="Password"
                  type="password"
                  label-color="white"
                  clearable
                  :disable="loading"
                />
              </QItemSection>
            </QItem>
            <QItem class="q-px-none">
              <QItemSection>
                <q-input
                  v-model="signUp.pass2"
                  dark
                  dense
                  filled
                  label="Confirm Password"
                  type="password"
                  label-color="white"
                  clearable
                  :disable="loading"
                />
              </QItemSection>
            </QItem>
            <QItem class="q-px-none">
              <QItemSection>
                <div v-if="!NewAcctPWOK()" class="col-12 q-mb-sm">
                  <ul class="pw-warning">
                    <li v-if="!pwMinChars(signUp.pass1)">
                      Password should be at least 8 characters long.
                    </li>
                    <li v-if="!pwUppercase(signUp.pass1)">
                      Must have at least one uppercase letter
                    </li>
                    <li v-if="!pwLowercase(signUp.pass1)">
                      Must have at least one lowercase letter
                    </li>
                    <li v-if="!pwHasDigit(signUp.pass1)">
                      Must have at least one digit
                    </li>
                    <li v-if="!pwMatch(signUp.pass1, signUp.pass2)">
                      Password should match
                    </li>
                  </ul>
                </div>
              </QItemSection>
            </QItem>
            <QItem class="q-px-none">
              <QItemSection>
                <QBtn
                  class="full-width"
                  :label="
                    loading ? 'Processing Request...' : 'Sign Up'
                  "
                  color="green"
                  size="md"
                  :disable="loading || !NewAcctPWOK()"
                />
              </QItemSection>
            </QItem>
          </QList>
          <div class="col-12 q-my-md">
            <QBtn
              class="full-width"
              label="Already have an account? Log in"
              size="md"
              flat
              :disable="loading"
              text-color="grey"
              no-caps
              @click="SwitchMode(1)"
            />
          </div>
        </QCardSection>

        <QCardSection v-else-if="showUI">
          <q-carousel
            v-model="panel"
            transition-prev="scale"
            transition-next="scale"
            swipeable
            navigation
            animated
            infinite
            control-color="white"
            class="login-carousel transparent"
            padding
            style="background: transparent"
          >
            <q-carousel-slide
              name="form1"
              class="row"
              style="align-content: flex-start"
            >
              <div class="col-12 q-mb-md">
                <QBtn
                  class="full-width"
                  :label="
                    GetLocaleString(
                      'AD_SIGNIN',
                      'Sign in with Excelitas Account'
                    )
                  "
                  color="green"
                  size="md"
                  @click="SSOLogin"
                />
              </div>

              <div class="col-12 q-mb-md text-center flex justify-center">
                <!-- <hr style="width:50px;margin:10px"/> -->
                <span>{{ GetLocaleString("OR", "Or") }}</span>
                <!-- <hr style="width:50px;margin:10px"/> -->
              </div>

              <div class="col-12 q-mb-md">
                <q-input
                  v-model="creds.username"
                  dark
                  filled
                  :label="GetLocaleString('CARD_NO', 'Card No.')"
                  label-color="white"
                  clearable
                  dense
                  :disable="loading"
                />
              </div>
              <div class="col-12 q-mb-sm">
                <q-input
                  v-model="creds.pass"
                  dark
                  filled
                  :label="GetLocaleString('PASSWORD', 'Password')"
                  type="password"
                  label-color="white"
                  dense
                  @keydown.enter="Login"
                  :disable="loading"
                />
              </div>
              <div class="col-12 q-mb-md">
                <q-checkbox
                  v-model="remember"
                  dark
                  filled
                  dense
                  :label="GetLocaleString('REMEMBER_ME', 'Remember Me')"
                  label-color="white"
                />
              </div>
              <div class="col-12 q-mb-md">
                <QBtn
                  class="full-width"
                  :label="
                    loading
                      ? `${GetLocaleString('AUTHENTICATING', 'Authenticating')}`
                      : `${GetLocaleString('LOGIN', 'Login')}`
                  "
                  color="green"
                  size="md"
                  @click="Login"
                  :disable="loading"
                />
              </div>
              <div class="col-12 q-mt-md">
                <QBtn
                  class="full-width"
                  :label="
                    GetLocaleString('FORGOT_PW', 'Forgot password? Click here')
                  "
                  size="md"
                  flat
                  :disable="loading"
                  text-color="grey"
                  no-caps
                  @click="SwitchMode(2)"
                />
              </div>
              <div class="col-12 q-mt-none">
                <QBtn
                  class="full-width"
                  :label="GetLocaleString('SIGN_UP', 'New User? Sign-up here')"
                  size="md"
                  flat
                  :disable="loading"
                  text-color="grey"
                  no-caps
                  @click="SwitchMode(3)"
                />
              </div>
            </q-carousel-slide>
            <q-carousel-slide
              name="form2"
              class="row"
              style="align-content: flex-start"
            >
              <div class="col-12 q-mb-md">
                <q-input
                  v-model="creds.accesskey"
                  dark
                  filled
                  label="Access Key"
                  label-color="white"
                  clearable
                  type="password"
                  dense
                  hint="Hint: Scan the barcode on your badge"
                  @keydown.enter="Login2"
                  tabindex="0"
                  :disable="loading"
                />
              </div>
              <div class="col-12 q-mb-md">
                <QBtn
                  class="full-width"
                  :label="loading ? 'Authenticating...' : 'Login'"
                  color="green"
                  size="md"
                  @click="Login2"
                  :disable="loading"
                />
              </div>
            </q-carousel-slide>
          </q-carousel>

          <!-- <q-tabs
            v-model="panel"
            dense
            align="center"
            class="text-white q-mt-lg"
            :breakpoint="0"
            narrow-indicator
          >
            <q-tab name="form1" class="tab-indicator" :ripple="false"
              ><div class="content"></div
            ></q-tab>
            <q-tab name="form2" class="tab-indicator" :ripple="false"
              ><div class="content"></div
            ></q-tab>
          </q-tabs> -->
        </QCardSection>

        <QSeparator dark class="q-mx-md" />

        <QCardSection class="text-center q-pa-lg" style="font-size: 0.8em">
          <div>PDCS 2022</div>
          <div>All Rights Reserved</div>
        </QCardSection>
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
  background-size: cover !important;
}
.login-card {
  width: 400px;
  background: #222;

  .q-carousel {
    height: 440px;
  }
}

.maximized {
  width: 100%;
  height: 100%;
}

@media (max-width: 425px) {
  .login-card {
    width: 100%;
    height: 100%;
  }
}
</style>

<style lang="scss">
.login-page {
  .login-carousel{
    .q-carousel__slides-container{
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
import { onMounted, ref, computed, watch, inject } from "vue";
//
import general from "../mixins/general";
import { useQuasar } from "quasar";
import { useUser } from "../store/user";
import api from "../api/index";
import server from "../server";

export default {
  name: "Login",
  components: {},
  setup() {
    const q = useQuasar();
    const user = useUser();
    const {
      navigateTo,
      NotifyUser,
      hasKey,
      pwMinChars,
      pwUppercase,
      pwLowercase,
      pwHasDigit,
      pwMatch,
    } = general();
    const creds = ref({
      username: null,
      pass: null,
      accesskey: null,
    });
    const resetCreds = ref({
      cardNo: null,
      pass1: null,
      pass2: null,
    });
    const signUp = ref({
      cardNo: null,
      email: null,
      firstname: null,
      lastname: null,
      approvingManager: null,
      pass1: null,
      pass2: null,
    });
    const remember = ref(false);
    const loading = ref(false);
    const showUI = ref(false);
    const panel = ref("form1");
    const mode = ref(1);

    const mobile = computed(() => q.screen.width < 600);

    const AllowPWReset = () => {
      return (
        pwMinChars(resetCreds.value.pass1) &&
        pwUppercase(resetCreds.value.pass1) &&
        pwLowercase(resetCreds.value.pass1) &&
        pwHasDigit(resetCreds.value.pass1) &&
        pwMatch(resetCreds.value.pass1, resetCreds.value.pass2)
      );
    };

    const NewAcctPWOK = () => {
      return (
        pwMinChars(signUp.value.pass1) &&
        pwUppercase(signUp.value.pass1) &&
        pwLowercase(signUp.value.pass1) &&
        pwHasDigit(signUp.value.pass1) &&
        pwMatch(signUp.value.pass1, signUp.value.pass2)
      );
    };

    watch(
      mobile,
      () => {
        panel.value = mobile.value ? "form2" : "form1";
      },
      {
        immediate: true,
      }
    );

    const GetLocaleString = inject("GetLocaleString");

    const Login = () => {
      loading.value = true;
      api
        .PostLoginForm(creds.value)
        .then(async (response) => {
          loading.value = false;
          if (response.data.success) {
            creds.value.pass = null;
            window.localStorage.setItem(
              "_pdcs_remember",
              remember.value ? "1" : "0"
            );
            window.localStorage.setItem(
              "_pdcs_login",
              JSON.stringify(creds.value)
            );

            await user.SetUser(response.data.payload);

            if (hasKey(user.GroupMenu, "OC_CONF")) {
              navigateTo({ name: "Confirmation" }, true);
            } else {
              navigateTo({ name: "Dashboard" }, true);
            }
          } else {
            NotifyUser(response.data, [
              { label: "Dismiss", color: "white", handler: () => {} },
            ]);
          }
        })
        .catch(() => {
          loading.value = false;
        });
    };

    const Login2 = () => {
      loading.value = true;
      api
        .PostLoginSecureKey(creds.value)
        .then(async (response) => {
          loading.value = false;
          if (response.data.success) {
            await user.SetUser(response.data.payload);
            if (hasKey(user.GroupMenu, "OC_CONF")) {
              navigateTo({ name: "Confirmation" }, true);
            } else {
              navigateTo({ name: "Dashboard" }, true);
            }
          } else {
            NotifyUser(response.data, [
              { label: "Dismiss", color: "white", handler: () => {} },
            ]);
          }
        })
        .catch(() => {
          loading.value = false;
        });
    };

    const SSOLogin = () => {
      window.open(`${server.defaults.baseURL}/?sso=1`, "_self");
    };

    const SwitchMode = (data) => {
      showUI.value = false;
      mode.value = data;
      setTimeout(() => {
        showUI.value = true;
      }, 500);
    };

    const ResetPassword = () => {
      loading.value = true;
      api
        .ResetPassword(
          resetCreds.value.cardNo,
          resetCreds.value.pass1,
          false,
          null
        )
        .then((response) => {
          loading.value = false;
          if (response.data.success) {
            NotifyUser(response.data);
            resetCreds.value.cardNo = null;
            resetCreds.value.pass1 = null;
            resetCreds.value.pass2 = null;
            SwitchMode(1);
          } else {
            NotifyUser(response.data, [
              { label: "Dismiss", color: "white", handler: () => {} },
            ]);
          }
        })
        .catch(() => {
          loading.value = false;
        });
    };

    onMounted(() => {
      var r = window.localStorage.getItem("_pdcs_remember");
      var x = window.localStorage.getItem("_pdcs_login");

      if (x && r === "1") {
        try {
          remember.value = true;
          var y = JSON.parse(x);
          creds.value = { ...y };
        } catch {
          //
        }
      }

      setTimeout(() => {
        showUI.value = true;
      }, 500);

      if (q.cookies.has("_xmap_auth") && !q.cookies.has("_pdcs_oss_inv")) {
        navigateTo({ name: "Confirmation" }, true);
      }

      if (q.cookies.has("_pdcs_oss_inv")) {
        var u = q.cookies.get("_pdcs_oss_inv");
        NotifyUser(
          {
            success: false,
            message: `The email <b>${u}</b> is not found in the registered users of PDCS. Please try to login using the form.`,
          },
          undefined,
          { timeout: 6000, progress: true }
        );
        q.cookies.remove("_pdcs_oss_inv");
      }
    });

    return {
      resetCreds,
      signUp,
      mode,
      showUI,
      mobile,
      panel,
      loading,
      creds,
      remember,
      Login,
      Login2,
      SSOLogin,
      SwitchMode,
      GetLocaleString,
      ResetPassword,
      pwMinChars,
      pwUppercase,
      pwLowercase,
      pwHasDigit,
      pwMatch,
      AllowPWReset,
      NewAcctPWOK,
    };
  },
};
</script>
