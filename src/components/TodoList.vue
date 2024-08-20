<template>
  <div class="todo-app">
    <!--task list app content-->
    <p>
      Level:
      <span id="text-numeric-display">{{
        getCurrentLevel.toLocaleString("en-US")
      }}</span>
    </p>
    <p>
      XP:
      <span id="text-numeric-display">{{
        getCurrentXp.toLocaleString("en-US")
      }}</span>
    </p>
    <p>
      Daily Streak:
      <span id="text-numeric-display">{{
        getCurrentDailyStreak.toLocaleString("en-US")
      }}</span>
    </p>
    <p>
      Tasks Completed Today:
      <span id="text-numeric-display">{{
        getCurrentTasksCompletedToday.toLocaleString("en-US")
      }}</span>
    </p>
    <p>
      Total Tasks Completed:
      <span id="text-numeric-display">{{
        getCurrentTotalTasksCompleted.toLocaleString("en-US")
      }}</span>
    </p>
    <p>
      Score:
      <span id="text-numeric-display">{{
        getCurrentScore.toLocaleString("en-US")
      }}</span>
    </p>
    <p>
      Best Points Earned After Completing the Task:
      <span id="text-numeric-display">{{
        getCurrentBestScoreEarned.toLocaleString("en-US")
      }}</span>
    </p>
    <p>
      Rating:
      <span id="text-numeric-display">{{
        getCurrentRating.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      }}</span>
    </p>
    <!--show circular progress bar filled with level progress--><ve-progress
      :progress="getCurrentProgress"
      >Level
      <span id="text-numeric-display">{{
        getCurrentLevel.toLocaleString("en-US")
      }}</span></ve-progress
    >
    <h3>Task list</h3>
    <ul class="todos">
      <!--repeat for each tasks-->
      <li v-for="todo in todos" :key="todo.newId" class="todo">
        <span
          v-bind:class="{
            overdue: new Date(todo.dueDate + ' 23:59:59.999') < new Date(),
          }"
          ><span id="text-numeric-display">{{ todo.task }}</span> <br />Streak:
          <span id="text-numeric-display">{{
            todo.streak.toLocaleString("en-US")
          }}</span>
          <br />Rank:
          <span id="text-numeric-display">{{
            todo.rank.toLocaleString("en-US")
          }}</span>
          <br /><progress max="100" :value="todo.rankProgress"></progress
          ><br />Due date:
          <span id="text-numeric-display">{{ todo.dueDate }}</span>
          <br />Priority:
          <span id="text-numeric-display">{{ todo.priority }}</span>
          <br />Difficulty:
          <span id="text-numeric-display">{{ todo.difficulty }}</span>
          <br />Repeat:
          <span v-if="todo.repeatInterval != 5"
            ><span id="text-numeric-display">{{
              todo.repeatEvery.toLocaleString("en-US")
            }}</span></span
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
    rank: Number,
    rankXp: Number,
    rankProgress: Number,
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
    getCurrentRating() {
      return store.getters.getRating; //get current rating
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
    completeTodo: function (id: number): void {
      store.dispatch("completeTask", id);
    },
    /**
     * Delete task based on task ID.
     * @param id task ID
     */
    deleteTodo: function (id: number): void {
      store.dispatch("deleteTask", id);
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<link scoped lang="scss" src="./TodoList.scss" />
