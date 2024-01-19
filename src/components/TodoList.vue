<template>
  <div class="todo-app">
    <h1>Todo List</h1>
    <p>Level: {{ levels }}</p><br/>
    <p>XP: {{ xps }}</p><br/>
    <ul class="todos">
      <li v-for="todo in todos" :key="todo.id" class="todo">
        {{ todo.task }}
        <button @click="completeTodo(todo.id)">Complete</button>
        <button @click="deleteTodo(todo.id)">Delete</button><br/>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import store from '@/store';
import { defineComponent } from 'vue';

export enum repeatFrequency {
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
  Yearly = 4,
  Once = 5
}
export enum difficulty {
  Easy = 1,
  Medium = 2,
  Hard = 3
}
export enum priority {
  Low = 1,
  Medium = 2,
  High = 3
}
export default defineComponent({
  name: 'TodoList',
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
    completed: Boolean
  },
  computed: {
    todos() {
      return store.getters.getTodos;
    },
    levels() {
      return store.getters.getLevel;
    },
    xps() {
      return store.getters.getXp;
    }
  },
  methods: {
    completeTodo: function (id: number) {
      store.dispatch("completeTodo", id);
    },
    deleteTodo: function (id: number) {
      store.dispatch("deleteTodo", id);
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<link scoped lang="scss" src="./TodoList.scss"/>
