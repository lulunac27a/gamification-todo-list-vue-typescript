<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <div>
    <NewTodo />
    <TodoList />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NewTodo from "./components/NewTodo.vue";
import TodoList from "./components/TodoList.vue";

export default defineComponent({
  name: "App",
  components: {
    NewTodo,
    TodoList,
  },
});
</script>

<link lang="scss" src="./App.scss" />
