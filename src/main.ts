import { createApp, h } from "vue";
import App from "./App.vue";
import store from "./store";
import veProgress from "vue-ellipse-progress";

createApp({ render: () => h(App) })
  .use(store)
  .use(veProgress)
  .mount("#app");
//eslint-disable-next-line
store.dispatch("loadUser").then(
  (success) => {
    console.log("User data loaded successfully!");
  },
  (error) => {
    console.log("User data failed to load.");
  }
); //load user data
//eslint-disable-next-line
store.dispatch("loadTodos").then(
  (success) => {
    console.log("Task list data loaded successfully!");
  },
  (error) => {
    console.log("Task list data failed to load.");
  }
); //load task list data
