<template>
  <Board>
    <QCardSection class="q-pa-md">
      <QList>
        <QItem class="QCard q-mb-md">
          <QItemSection avatar>
            <QAvatar size="42px" style="margin-left: -8px">
              <img :src="require('../assets/tech_light.jpg')" />
            </QAvatar>
          </QItemSection>
          <QItemSection>
            <div class="text-h6">
              {{ activeUser.FirstName }} {{ activeUser.LastName }}
            </div>
            <div>Card No: {{ activeUser.CardNo }}</div>
          </QItemSection>
          <QItemSection side>
            <QBtn icon="r_logout" flat round @click="Logout" />
          </QItemSection>
        </QItem>
      </QList>
    </QCardSection>

    <QCardSection class="row q-pa-md">
      <div class="col-12 col-xs-6">
        <QCard>
          <QCardSection> Switch View </QCardSection>
        </QCard>
      </div>
    </QCardSection>
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
