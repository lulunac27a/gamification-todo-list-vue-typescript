<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <div>
    <h1>Todo List Application using Vue, TypeScript and Vuex</h1>
    <p>
      This is a task list application using Vue, TypeScript and Vuex with SCSS
      styles. It supports gamification like levels and experience points (XP).
    </p>
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

<link lang="scss" href="./App.scss" />
