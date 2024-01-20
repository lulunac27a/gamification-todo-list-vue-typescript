import { createApp, h } from "vue";
import App from "./App.vue";
import store from "./store";

createApp({ render: () => h(App) })
  .use(store)
  .mount("#app");
store.dispatch("loadUser"); //load user data
store.dispatch("loadTodos"); //load task list data
