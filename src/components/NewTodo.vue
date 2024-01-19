<template>
    <form @submit.prevent="addTodo">
        Name:<br/>
        <input class="todo-input" id="name" type="text" placeholder="Enter task name" v-model="task" required/><br/>
        Due date:<br/>
        <input class="todo-input" id="dueDate" type="date" placeholder="Enter due date" v-model="dueDate" required/><br/>
        Priority:<br/>
        <select class="todo-input" id="priority" v-model="priority" required>
        <option value="1">Low</option><option value="2">Medium</option><option value="3">High</option></select><br/>
        Difficulty:<br/>
        <select class="todo-input" id="difficulty" v-model="difficulty" required>
        <option value="1">Easy</option><option value="2">Medium</option><option value="3">Hard</option></select><br/>
        Repeat often:<br/>
        <input class="todo-input" id="repeat-often" type="number" placeholder="Enter number of days/weeks/months/years to repeat" v-model="repeatOften" required min="1"/><br/>
        Repeat frequency:<br/>
        <select class="todo-input" id="repeat-frequency" v-model="repeatFrequency" required>
        <option value="1">Daily</option><option value="2">Weekly</option><option value="3">Monthly</option><option value="4">Yearly</option><option value="5">Once</option></select><br/>
        <button type="submit">Add Todo</button>
    </form>
</template>

<script lang="ts">
import store from '@/store';
import { difficulty, priority, repeatFrequency } from './TodoList.vue';
import { defineComponent } from 'vue';

export interface todoTask {
    task: string;
    dueDate: Date;
    priority: number;
    difficulty: number;
    repeatOften: number;
    repeatFrequency: number;
    newId: number;
    completed: boolean;
}
const currentUtcDate: Date = new Date();
const currentLocalDate: Date = new Date(currentUtcDate.setMinutes(currentUtcDate.getMinutes() - currentUtcDate.getTimezoneOffset()));

export default defineComponent ({
    data() {
        return {
            task: "",
            dueDate: currentLocalDate.toISOString().split('T')[0],
            priority: priority.Low,
            difficulty: difficulty.Easy,
            repeatOften: 1,
            repeatFrequency: repeatFrequency.Once,
            newId: 0,
            completed: false
        };
    },
    mounted() {
        const dueDateInput = document.getElementById('dueDate') as HTMLInputElement;
        dueDateInput.min = currentLocalDate.toISOString().split('T')[0];
    },
    methods: {
        addTodo: function(): void | todoTask[] {
            store.dispatch("createTodo", this);
            this.newId++;
            this.task = "";
            this.dueDate = currentLocalDate.toISOString().split('T')[0];
            this.priority = priority.Low;
            this.difficulty = difficulty.Easy;
            this.repeatOften = 1;
            this.repeatFrequency = repeatFrequency.Once;
            this.completed = false;
        }
    }
});
</script>

<style lang="scss">

</style>
