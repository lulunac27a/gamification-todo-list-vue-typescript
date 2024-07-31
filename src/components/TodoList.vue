<template>
  <div class="todo-app">
    <p>Level: {{ getCurrentLevel.toLocaleString("en-US") }}</p>
    <p>XP: {{ getCurrentXp.toLocaleString("en-US") }}</p>
    <p>Daily Streak: {{ getCurrentDailyStreak.toLocaleString("en-US") }}</p>
    <p>
      Tasks Completed Today:
      {{ getCurrentTasksCompletedToday.toLocaleString("en-US") }}
    </p>
    <p>
      Total Tasks Completed:
      {{ getCurrentTotalTasksCompleted.toLocaleString("en-US") }}
    </p>
    <p>Score: {{ getCurrentScore.toLocaleString("en-US") }}</p>
    <p>
      Best Points Earned After Completing the Task:
      {{ getCurrentBestScoreEarned.toLocaleString("en-US") }}
    </p>
    <!--show circular progress bar filled with level progress--><ve-progress
      :progress="getCurrentProgress"
      >Level {{ getCurrentLevel.toLocaleString("en-US") }}</ve-progress
    >
    <h3>Task list</h3>
    <ul class="todos">
      <!--repeat for each tasks-->
      <li v-for="todo in todos" :key="todo.newId" class="todo">
        <span
          v-bind:class="{
            overdue: new Date(todo.dueDate + ' 23:59:59.999') < new Date(),
          }"
          >{{ todo.task }} <br />Streak:
          {{ todo.streak.toLocaleString("en-US") }} <br />Due date:
          {{ todo.dueDate }} <br />Priority: {{ todo.priority }}
          <br />Difficulty: {{ todo.difficulty }} <br />Repeat:
          <span v-if="todo.repeatInterval != 5">{{
            todo.repeatEvery.toLocaleString("en-US")
          }}</span
          >&nbsp;<span v-if="todo.repeatInterval == 1">Day</span
          ><span v-if="todo.repeatInterval == 2">Week</span
          ><span v-if="todo.repeatInterval == 3">Month</span
          ><span v-if="todo.repeatInterval == 4">Year</span
          ><span v-if="todo.repeatInterval == 5">Once</span
          ><span v-if="todo.repeatEvery > 1 && todo.repeatInterval != 5"
            >s</span
          ></span
        >
        <!--don't show complete button if one-time task is completed--><button
          v-if="!todo.isCompleted"
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

export enum RepeatInterval {
  Daily = 1, //daily gets 1x XP, weekly gets 2x XP, monthly gets 3x XP, yearly gets 4x XP, one-time gets 5x XP multiplier
  Weekly = 2,
  Monthly = 3,
  Yearly = 4,
  Once = 5,
}
export enum Difficulty {
  Easy = 1, //easy gets 1x XP, medium gets 2x XP, hard gets 3x XP multiplier
  Medium = 2,
  Hard = 3,
}
export enum Priority {
  Low = 1, //low gets 1x XP, medium gets 2x XP, hard gets 3x XP multiplier
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
    repeatInterval: String,
    repeatEvery: Number,
    level: Number,
    xp: Number,
    isCompleted: Boolean,
    timesCompleted: Number,
    streak: Number,
    dailyStreak: Number,
    originalDueDate: Date,
  },
  computed: {
    todos() {
      //eslint-disable-next-line
      return store.getters.getTodos.sort((a: any, b: any) =>
        a.dueDate.localeCompare(b.dueDate),
      ); //get tasks (todos) and sort tasks by task's due date with the top one the oldest
    },
    getCurrentLevel() {
      return store.getters.getLevel; //get current level
    },
    getCurrentXp() {
      return store.getters.getXp; //get current XP
    },
    getCurrentProgress() {
      return store.getters.getProgress; //get current progress
    },
    getCurrentScore() {
      return store.getters.getScore; //get current score
    },
    getCurrentDailyStreak() {
      return store.getters.getDailyStreak; //get current daily streak
    },
    getCurrentTasksCompletedToday() {
      return store.getters.getTasksCompletedToday; //get tasks completed in a day (today)
    },
    getCurrentTotalTasksCompleted() {
      return store.getters.getTotalTasksCompleted; //get total tasks completed
    },
    getCurrentLastCompletedDate() {
      return store.getters.getLastCompletionDate; //get the current last completion date
    },
    getCurrentBestScoreEarned() {
      return store.getters.getBestScoreEarned; //get best score earned
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
