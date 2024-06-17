<template>
  <div class="todo-app">
    <p>Level: {{ levels.toLocaleString("en-US") }}</p>
    <p>XP: {{ xps.toLocaleString("en-US") }}</p>
    <p>Daily Streak: {{ dailyStreaks.toLocaleString("en-US") }}</p>
    <p>
      Tasks Completed Today: {{ tasksCompletedTodays.toLocaleString("en-US") }}
    </p>
    <p>
      Total Tasks Completed: {{ totalTasksCompletions.toLocaleString("en-US") }}
    </p>
    <p>Score: {{ scores.toLocaleString("en-US") }}</p>
    <p>
      Best Points Earned After Completing the Task:
      {{ bestScoreEarneds.toLocaleString("en-US") }}
    </p>
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
          >{{ todo.task }} <br />Streak:
          {{ todo.streak.toLocaleString("en-US") }} <br />Due date:
          {{ todo.dueDate }} <br />Priority: {{ todo.priority }}
          <br />Difficulty: {{ todo.difficulty }} <br />Repeat:
          <span v-if="todo.repeatFrequency != 5">{{
            todo.repeatOften.toLocaleString("en-US")
          }}</span
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
  Daily = 1, //daily gets 1x XP, weekly gets 2x XP, monthly gets 3x XP, yearly gets 4x XP, one-time gets 5x XP multiplier
  Weekly = 2,
  Monthly = 3,
  Yearly = 4,
  Once = 5,
}
export enum difficulty {
  Easy = 1, //easy gets 1x XP, medium gets 2x XP, hard gets 3x XP multiplier
  Medium = 2,
  Hard = 3,
}
export enum priority {
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
    repeatFrequency: String,
    repeatOften: Number,
    level: Number,
    xp: Number,
    completed: Boolean,
    timesCompleted: Number,
    streak: Number,
    dailyStreak: Number,
    originalDueDate: Date,
  },
  computed: {
    todos() {
      //eslint-disable-next-line
      return store.getters.getTodos.sort((a: any, b: any) =>
        a.dueDate.localeCompare(b.dueDate)
      ); //get tasks (todos) and sort tasks by task's due date with the top one the oldest
    },
    levels() {
      return store.getters.getLevel; //get current level
    },
    xps() {
      return store.getters.getXp; //get current XP
    },
    progresses() {
      return store.getters.getProgress; //get current progress
    },
    scores() {
      return store.getters.getScore; //get current score
    },
    dailyStreaks() {
      return store.getters.getDailyStreak; //get current daily streak
    },
    tasksCompletedTodays() {
      return store.getters.getTasksCompletedToday; //get tasks completed in a day (today)
    },
    totalTasksCompletions() {
      return store.getters.getTotalTasksCompleted; //get total tasks completed
    },
    lastCompletedDates() {
      return store.getters.getLastCompletionDate; //get current last completion date
    },
    bestScoreEarneds() {
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
