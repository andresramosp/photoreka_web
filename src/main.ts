import { createApp } from "vue";
import { createPinia } from "pinia";
import {
  create,
  NConfigProvider,
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NButton,
  NIcon,
  NSpace,
  NCard,
  NGrid,
  NGridItem,
  NStatistic,
  NAvatar,
  NDropdown,
  NTag,
  NDataTable,
  NInput,
  darkTheme,
} from "naive-ui";

import App from "./App.vue";
import router from "./router";

const naive = create({
  components: [
    NConfigProvider,
    NLayout,
    NLayoutSider,
    NLayoutHeader,
    NLayoutContent,
    NMenu,
    NButton,
    NIcon,
    NSpace,
    NCard,
    NGrid,
    NGridItem,
    NStatistic,
    NAvatar,
    NDropdown,
    NTag,
    NDataTable,
    NInput,
  ],
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(naive);

app.mount("#app");
