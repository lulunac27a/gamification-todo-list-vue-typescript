<template>
  <div class="todo-app">
    <h1>Todo List</h1>
    <p>Level: {{ levels }}</p>
    <br />
    <p>XP: {{ xps }}</p>
    <br />
    <ul class="todos">
      <li v-for="todo in todos" :key="todo.newId" class="todo">
        <span
          v-bind:class="{
            overdue: new Date(todo.dueDate + ' 23:59:59.999') < new Date(),
          }"
          >{{ todo.task }}: Due {{ todo.dueDate }} Priority:
          {{ todo.priority }} Difficulty: {{ todo.difficulty }} Repeat:
          <span v-if="todo.repeatFrequency != 5">{{ todo.repeatOften }}</span>
          <span v-if="todo.repeatFrequency == 1">Day</span
          ><span v-if="todo.repeatFrequency == 2">Week</span
          ><span v-if="todo.repeatFrequency == 3">Month</span
          ><span v-if="todo.repeatFrequency == 4">Year</span
          ><span v-if="todo.repeatFrequency == 5">Once</span
          ><span v-if="todo.repeatOften > 1">s</span></span
        >
        <button @click="completeTodo(todo.newId)">Complete</button>
        <button @click="deleteTodo(todo.newId)">Delete</button><br />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import store from "@/store";
import { defineComponent } from "vue";

export enum repeatFrequency {
  Daily = 1, //daily gets 1x xp, weekly gets 2x xp, monthly gets 3x xp, yearly gets 4x xp, one-time gets 5x xp multiplier
  Weekly = 2,
  Monthly = 3,
  Yearly = 4,
  Once = 5,
}
export enum difficulty {
  Easy = 1, //easy gets 1x xp, medium gets 2x xp, hard gets 3x xp multiplier
  Medium = 2,
  Hard = 3,
}
export enum priority {
  Low = 1, //low gets 1x xp, medium gets 2x xp, hard gets 3x xp multiplier
  Medium = 2,
  High = 3,
}
export default defineComponent({
  name: "TodoList",
  props: {
    newId: Number,
    tasks: Array,
    title: String,
    dueDate: Date,
    priority: Number,
    difficulty: Number,
    repeatFrequency: String,
    repeatOften: Number,
    level: Number,
    xp: Number,
    completed: Boolean,
  },
  computed: {
    todos() {
      return store.getters.getTodos; //get todos
    },
    levels() {
      return store.getters.getLevel; //get current level
    },
    xps() {
      return store.getters.getXp; //get current xp
    },
  },
  methods: {
    completeTodo: function (id: number) {
      store.dispatch("completeTask", id);
    },
    deleteTodo: function (id: number) {
      store.dispatch("deleteTask", id);
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<link scoped lang="scss" src="./TodoList.scss" />
