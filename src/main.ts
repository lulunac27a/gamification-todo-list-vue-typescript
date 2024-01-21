import { createApp, h } from "vue";
import App from "./App.vue";
import store from "./store";
import veProgress from "vue-ellipse-progress";

createApp({ render: () => h(App) })
  .use(store)
  .use(veProgress)
  .mount("#app");
store.dispatch("loadUser"); //load user data
store.dispatch("loadTodos"); //load task list data
