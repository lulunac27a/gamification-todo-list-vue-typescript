<template>
  <div class="todo-app">
    <p>Level: {{ levels.toLocaleString("en-US") }}</p>
    <p>XP: {{ xps.toLocaleString("en-US") }}</p>
    <!--show circular progress bar filled with level progress--><ve-progress
      :progress="progresses"
      >Level {{ levels.toLocaleString("en-US") }}</ve-progress
    >
    <h3>Task list</h3>
    <ul class="todos">
      <!--repeat for each tasks-->
      <li v-for="todo in todos" :key="todo.newId" class="todo">
        <span
          v-bind:class="{
            overdue: new Date(todo.dueDate + ' 23:59:59.999') < new Date(),
          }"
          >{{ todo.task }}: <br />Streak: {{ todo.streak }} <br />Due date:
          {{ todo.dueDate }} <br />Priority: {{ todo.priority }}
          <br />Difficulty: {{ todo.difficulty }} <br />Repeat:
          <span v-if="todo.repeatFrequency != 5">{{ todo.repeatOften }}</span
          >&nbsp;<span v-if="todo.repeatFrequency == 1">Day</span
          ><span v-if="todo.repeatFrequency == 2">Week</span
          ><span v-if="todo.repeatFrequency == 3">Month</span
          ><span v-if="todo.repeatFrequency == 4">Year</span
          ><span v-if="todo.repeatFrequency == 5">Once</span
          ><span v-if="todo.repeatOften > 1 && todo.repeatFrequency != 5"
            >s</span
          ></span
        >
        <!--don't show complete button if one-time task is completed--><button
          v-if="!todo.completed"
          @click="completeTodo(todo.newId)"
        >
          Complete
        </button>
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
    timesCompleted: Number,
    streak: Number,
    originalDueDate: Date,
  },
  computed: {
    todos() {
      //eslint-disable-next-line
      return store.getters.getTodos.sort((a: any, b: any) =>
        a.dueDate.localeCompare(b.dueDate)
      ); //get todos and sort tasks by due date with the top one the oldest
    },
    levels() {
      return store.getters.getLevel; //get current level
    },
    xps() {
      return store.getters.getXp; //get current xp
    },
    progresses() {
      return store.getters.getProgress; //get curent progress
    },
  },
  methods: {
    /**
     * Complete task based on task ID.
     * @param id task ID
     */
    completeTodo: function (id: number) {
      store.dispatch("completeTask", id);
    },
    /**
     * Delete task based on task ID.
     * @param id task ID
     */
    deleteTodo: function (id: number) {
      store.dispatch("deleteTask", id);
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<link scoped lang="scss" src="./TodoList.scss" />
