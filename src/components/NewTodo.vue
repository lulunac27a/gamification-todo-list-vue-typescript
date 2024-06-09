<template>
  <form @submit.prevent="addTodo">
    <!--all fields are required-->
    Name:<br /><!--name up to 255 characters-->
    <input
      class="todo-input"
      id="name"
      type="text"
      placeholder="Enter task name"
      maxlength="255"
      v-model="task"
      required
    /><br />
    Due date:<br /><!--task due date must be on or after today date-->
    <input
      class="todo-input"
      id="dueDate"
      type="date"
      placeholder="Enter due date"
      v-model="originalDueDate"
      required
    /><br />
    Priority:<br />
    <select class="todo-input" id="priority" v-model="priority" required>
      <option value="1">Low</option>
      <option value="2">Medium</option>
      <option value="3">High</option></select
    ><br />
    Difficulty:<br />
    <select class="todo-input" id="difficulty" v-model="difficulty" required>
      <option value="1">Easy</option>
      <option value="2">Medium</option>
      <option value="3">Hard</option></select
    ><br />
    Repeat often:<br />
    <input
      class="todo-input"
      id="repeat-often"
      type="number"
      placeholder="Enter number of days/weeks/months/years to repeat"
      v-model="repeatOften"
      required
      min="1"
      step="1"
    /><br />
    Repeat frequency:<br />
    <select
      class="todo-input"
      id="repeat-frequency"
      v-model="repeatFrequency"
      required
    >
      <option value="1">Daily</option>
      <option value="2">Weekly</option>
      <option value="3">Monthly</option>
      <option value="4">Yearly</option>
      <option value="5">Once</option></select
    ><br />
    <button type="submit">Add Todo</button>
  </form>
</template>

<script lang="ts">
import store from "@/store";
import { difficulty, priority, repeatFrequency } from "./TodoList.vue";
import { defineComponent } from "vue";

export interface todoTask {
  task: string; //task name
  dueDate: Date; //task due date
  priority: number; //task priority
  difficulty: number; //task difficulty
  repeatOften: number; //task repetition number of days/weeks/months/years
  repeatFrequency: number; //task repetition frequency
  newId: number; //task id
  completed: boolean; //task completed or not
  timesCompleted: number; //times task has been completed
  streak: number; //task completion streak
  originalDueDate: Date; //task original due date in YYYY-MM-DD string
}
const currentUtcDate: Date = new Date();
const currentLocalDate: Date = new Date(
  currentUtcDate.setMinutes(
    currentUtcDate.getMinutes() - currentUtcDate.getTimezoneOffset()
  )
);

export default defineComponent({
  data() {
    return {
      task: "",
      dueDate: currentLocalDate.toISOString().split("T")[0], //set default due date to today
      priority: priority.Low, //set default priority is low
      difficulty: difficulty.Easy, //set default difficulty is easy
      repeatOften: 1,
      repeatFrequency: repeatFrequency.Once, //set default task repetition to one-time
      newId: 0, //initial task id is 0
      completed: false, //task not completed if task is created
      timesCompleted: 0,
      streak: 0, //set default task streak to 0
      originalDueDate: currentLocalDate.toISOString().split("T")[0], //set default original task due date to today
    };
  },
  mounted() {
    const dueDateInput = document.getElementById("dueDate") as HTMLInputElement;
    dueDateInput.min = currentLocalDate.toISOString().split("T")[0]; //task minimum due date must be today
  },
  methods: {
    /**
     * Add task to todo list when user presses the Add Todo button.
     */
    addTodo: function (): void | todoTask[] {
      this.dueDate = this.originalDueDate; //set task due date to entered task original due date
      store.dispatch("createTask", this);
      this.newId++;
      this.task = "";
      this.dueDate = currentLocalDate.toISOString().split("T")[0];
      this.priority = priority.Low;
      this.difficulty = difficulty.Easy;
      this.repeatOften = 1;
      this.repeatFrequency = repeatFrequency.Once;
      this.completed = false;
      this.timesCompleted = 0;
      this.streak = 0;
      this.originalDueDate = currentLocalDate.toISOString().split("T")[0];
    },
  },
});
</script>

<style lang="scss"></style>
