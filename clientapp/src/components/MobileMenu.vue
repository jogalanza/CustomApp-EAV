<template>
  <Board>
    <q-card-section class="q-pa-md">
      <q-list>
        <q-item class="q-card q-mb-md">
          <q-item-section avatar>
            <q-avatar size="42px" style="margin-left: -8px">
              <img :src="require('@/assets/tech_light.jpg')" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <div class="text-h6">
              {{ activeUser.FirstName }} {{ activeUser.LastName }}
            </div>
            <div>Card No: {{ activeUser.CardNo }}</div>
          </q-item-section>
          <q-item-section side>
            <q-btn icon="r_logout" flat round @click="Logout" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-section class="row q-pa-md">
      <div class="col-12 col-xs-6">
        <q-card>
          <q-card-section> Switch View </q-card-section>
        </q-card>
      </div>
    </q-card-section>
  </Board>
</template>

<style scoped>
</style>

<script>
import { defineAsyncComponent, onMounted, ref, computed } from "vue";

import api from "../api/index";
import general from "../mixins/general";

export default {
  name: "MobileMenu",
  components: {
    Board: defineAsyncComponent(() => import("./General/Board.vue")),
    // ProfileAvatar: defineAsyncComponent(() =>
    //   import("./General/ProfileAvatar.vue")
    // ),
  },
  setup() {
    const user = useUser();
    const { navigateTo } = general();
    const itemStyle = ref("width: 100%");
    const dialog = ref(false);

    ;

    const Logout = () => {
      api.UserLogout().then(() => {
        navigateTo({ name: "Login" });
      });
    };

    onMounted(() => {
      store.dispatch("UpdateBoardTitle", "Menu");
    });

    return {
      Logout,
      activeUser,
      dialog,
      itemStyle,
    };
  },
};
</script>
