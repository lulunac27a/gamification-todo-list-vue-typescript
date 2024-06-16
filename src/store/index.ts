import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

export default createStore({
  state: {
    //eslint-disable-next-line
    todos: [] as any[],
    user: {
      level: 1 as number, //set level to 1 as total XP is 0 when state is created
      xp: 0 as number,
      progress: 0 as number,
      score: 0 as number, //set score to 0 when state is created
      dailyStreak: 0 as number, //set daily streak to 0 and last completion date to undefined when state is created
      tasksCompletedToday: 0 as number, //set number of tasks completed in a day (today) to 0
      totalTasksCompleted: 0 as number, //set total number of tasks completed to 0
      lastCompletionDate: undefined as string | undefined, //last completion date in YYYY-MM-DD string
    },
  },
  getters: {
    getTodos: (state) => state.todos, //get task list
    getXp: (state) => state.user.xp, //get user XP
    getLevel: (state) => state.user.level, //get user level
    getProgress: (state) => state.user.progress, //get user level progress
    getScore: (state) => state.user.score, //get user score
    getDailyStreak: (state) => state.user.dailyStreak, //get user daily streak
    getTasksCompletedToday: (state) => state.user.tasksCompletedToday, //get user tasks completed in a day
    getTotalTasksCompleted: (state) => state.user.totalTasksCompleted, //get user total tasks completed
    getLastCompletionDate: (state) => state.user.lastCompletionDate, //get user last completion date
  },
  mutations: {
    /**
     * Update user XP state when user presses Complete button to complete the task.
     */
    updateXp: (state, payload) => {
      const task = state.todos.find(
        (todo: { newId: number }) => todo.newId === payload
      );
      const daysToDue: number =
        (Number(new Date(task.dueDate + " 23:59:59.999")) -
          Number(new Date().setHours(23, 59, 59, 999))) /
        (1000 * 60 * 60 * 24); //calculate number of days until the task is due
      const dateMultiplier: number =
        daysToDue < 0
          ? -2 / (daysToDue - 1)
          : daysToDue === 0
          ? 4 /
            (1 +
              (Number(new Date().setHours(23, 59, 59, 999)) -
                Number(new Date())) /
                (1000 * 24 * 60 * 60))
          : 1 + 1 / (daysToDue + 1); //if task is overdue, XP and score multiplier is less than 1 that decreases over time when task is overdue, else XP multiplier bonus increases (more than 1) when task gets closer to due date
      let streakMultiplier: number; //calculate task streak XP and score multiplier based on task streak, if task is completed before the due date then the streak increases else if the task is completed overdue (after the due date) reset task streak to 0
      let repeatMultiplier: number; //calculate task repetition XP and score multiplier based on task repetition occurrence and task repetition frequency
      let dailyStreakMultiplier: number; //calculate daily streak XP and score multiplier based on daily streak
      let levelMultiplier: number; //calculate level score multiplier based on user level
      let dayTasksMultiplier: number; //calculate XP and score multiplier for tasks completed in a day (today)
      let tasksMultiplier: number; //calculate score multiplier for total number of tasks completed
      const activeTasks: number = state.todos.filter(
        (taskList) => !taskList.completed
      ).length; //calculate number of active tasks (tasks that are not completed) using array.filter
      let activeTasksMultiplier: number; //calculate score multiplier for number of active tasks (tasks that are not completed)
      //calculate task repetition XP multiplier
      if (Number(task.repeatFrequency) === 1) {
        //if task repetition is daily
        if (task.repeatOften < 7) {
          //7 days is 1 week
          repeatMultiplier = 1 + (task.repeatOften - 1) / (7 - 1); //1x XP multiplier for daily tasks (1 day) to 2x XP multiplier for weekly tasks (7 days)
        } else if (task.repeatOften < 30) {
          //approximately 30 days is 1 month
          repeatMultiplier = 2 + (task.repeatOften - 7) / (30 - 7); //2x XP multiplier for weekly tasks (7 days) to 3x XP multiplier for monthly tasks (approximately 30 days)
        } else if (task.repeatOften < 365) {
          //approximately 365 days is 1 year
          repeatMultiplier = 3 + (task.repeatOften - 30) / (365 - 30); //3x XP multiplier for monthly tasks (approximately 30 days) to 4x XP multiplier for yearly tasks (approximately 365 days)
        } else {
          repeatMultiplier = 5 - 365 / task.repeatOften; //4x XP multiplier for yearly tasks (approximately 365 days) to 5x XP multiplier for one-time tasks
        }
      } else if (Number(task.repeatFrequency) === 2) {
        //if task repetition is weekly
        if (task.repeatOften < 4) {
          //approximately 4 weeks is 1 month
          repeatMultiplier = 2 + (task.repeatOften - 1) / (4 - 1); //2x XP multiplier for weekly tasks (1 week) to 3x XP multiplier for monthly tasks (approximately 4 weeks)
        } else if (task.repeatOften < 52) {
          //approximately 52 weeks is 1 year
          repeatMultiplier = 3 + (task.repeatOften - 4) / (52 - 4); //3x XP multiplier for monthly tasks (approximately 4 weeks) to 4x XP multiplier for yearly tasks (approximately 52 weeks)
        } else {
          repeatMultiplier = 5 - 52 / task.repeatOften; //4x XP multiplier for yearly tasks (approximately 52 weeks) to 5x XP multiplier for one-time tasks
        }
      } else if (Number(task.repeatFrequency) === 3) {
        //if task repetition is monthly
        if (task.repeatOften < 12) {
          //12 months is 1 year
          repeatMultiplier = 3 + (task.repeatOften - 1) / (12 - 1); //3x XP multiplier for monthly tasks (1 month) to 4x XP multiplier for yearly tasks (12 months)
        } else {
          repeatMultiplier = 5 - 12 / task.repeatOften; //4x XP multiplier for yearly tasks (12 months) to 5x XP multiplier for one-time tasks
        }
      } else if (Number(task.repeatFrequency) === 4) {
        //if task repetition is yearly
        repeatMultiplier = 5 - 1 / task.repeatOften; //4x XP multiplier for yearly tasks (1 year) to 5x XP multiplier for one-time tasks
      } else {
        //if task repetition is one-time
        repeatMultiplier = 5; //get 5x XP multiplier for one-time tasks
      }
      //calculate task streak
      if (daysToDue < 0) {
        //if task is overdue
        task.streak = 0; //reset task streak to 0
      } else {
        //if task is completed before due date (not overdue)
        task.streak++; //increase task streak
      }
      //calculate daily streak
      if (
        state.user.lastCompletionDate === undefined ||
        new Date(new Date().setDate(new Date().getDate() - 1)) >
          new Date(state.user.lastCompletionDate + " 23:59:59.999")
      ) {
        //if user last completion date is before yesterday or undefined (no user task completed yet)
        state.user.dailyStreak = 1; //reset daily streak to 1
      } else if (
        Number(new Date(new Date().setHours(23, 59, 59, 999))) -
          Number(new Date(state.user.lastCompletionDate + " 23:59:59.999")) ===
        1000 * 60 * 60 * 24
      ) {
        state.user.dailyStreak++; //increase daily streak
      }
      //calculate number of tasks completed in a day
      if (
        state.user.lastCompletionDate === undefined ||
        Number(new Date(state.user.lastCompletionDate + " 23:59:59.999")) !==
          Number(new Date(new Date().setHours(23, 59, 59, 999)))
      ) {
        state.user.tasksCompletedToday = 1; //reset tasks completed in a day to 1
      } else {
        state.user.tasksCompletedToday++; //increase tasks completed in a day by 1
      }
      //calculate daily streak XP multiplier
      if (state.user.dailyStreak === 0 || state.user.dailyStreak === 1) {
        dailyStreakMultiplier = 1; //1x daily streak XP multiplier if daily streak is 0 or 1
      } else if (state.user.dailyStreak < 3) {
        dailyStreakMultiplier = 1 + 0.1 * (state.user.dailyStreak - 1); //1x daily streak XP multiplier from 1 streak plus 0.1x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 7) {
        //1 week is 7 days
        dailyStreakMultiplier = 1.2 + 0.05 * (state.user.dailyStreak - 3); //1.2x daily streak XP multiplier from 3 streak plus 0.05x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 14) {
        //2 weeks is 14 days
        dailyStreakMultiplier = 1.4 + 0.04 * (state.user.dailyStreak - 7); //1.4x daily streak XP multiplier from 7 streak plus 0.04x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 30) {
        //1 month is approximately 30 days
        dailyStreakMultiplier = 1.68 + 0.03 * (state.user.dailyStreak - 14); //1.68x daily streak XP multiplier from 14 streak plus 0.03x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 60) {
        //2 months is approximately 60 days
        dailyStreakMultiplier = 2.16 + 0.02 * (state.user.dailyStreak - 30); //2.16x daily streak XP multiplier from 30 streak plus 0.02x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 90) {
        //3 months is approximately 90 days
        dailyStreakMultiplier = 2.76 + 0.015 * (state.user.dailyStreak - 60); //2.76x daily streak XP multiplier from 60 streak plus 0.015x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 180) {
        //6 months is approximately 180 days
        dailyStreakMultiplier = 3.21 + 0.01 * (state.user.dailyStreak - 90); //3.21x daily streak XP multiplier from 90 streak plus 0.01x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 365) {
        //1 year is approximately 365 days
        dailyStreakMultiplier = 4.11 + 0.005 * (state.user.dailyStreak - 180); //4.11x daily streak XP multiplier from 180 streak plus 0.005x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 730) {
        //2 years is approximately 730 days
        dailyStreakMultiplier = 5.035 + 0.003 * (state.user.dailyStreak - 365); //5.035x daily streak XP multiplier from 365 streak plus 0.003x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 1461) {
        //4 years is approximately 1461 days
        dailyStreakMultiplier = 6.13 + 0.002 * (state.user.dailyStreak - 730); //6.13x daily streak XP multiplier from 730 streak plus 0.002x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 3652) {
        //10 years is approximately 3652 days
        dailyStreakMultiplier = 7.592 + 0.001 * (state.user.dailyStreak - 1461); //7.592x daily streak XP multiplier from 1,461 streak plus 0.001x streak multiplier for each daily streak
      } else {
        dailyStreakMultiplier = 9.783; //9.783x daily streak XP multiplier from 3,652 daily streak
      }

      //set last completion date to today
      state.user.lastCompletionDate = new Date(
        new Date().setMinutes(
          new Date().getMinutes() - new Date().getTimezoneOffset()
        )
      )
        .toISOString()
        .split("T")[0];
      //calculate task streak XP multiplier
      if (
        task.streak === 0 ||
        task.streak === 1 ||
        task.repeatFrequency === 5
      ) {
        streakMultiplier = 1; //1x task streak XP multiplier if task streak is 0 or 1 or completed a one-time task
      } else if (task.streak < 5) {
        streakMultiplier = 1.1 + 0.05 * (task.streak - 1); //1.1x task streak XP multiplier from 1 streak plus 0.05x streak multiplier for each task streak
      } else if (task.streak < 10) {
        streakMultiplier = 1.3 + 0.04 * (task.streak - 5); //1.3x task streak XP multiplier from 5 streak plus 0.04x streak multiplier for each task streak
      } else if (task.streak < 20) {
        streakMultiplier = 1.5 + 0.03 * (task.streak - 10); //1.5x task streak XP multiplier from 10 streak plus 0.03x streak multiplier for each task streak
      } else if (task.streak < 50) {
        streakMultiplier = 1.8 + 0.02 * (task.streak - 20); //1.8x task streak XP multiplier from 20 streak plus 0.02x streak multiplier for each task streak
      } else if (task.streak < 100) {
        streakMultiplier = 2.4 + 0.01 * (task.streak - 50); //2.4x task streak XP multiplier from 50 streak plus 0.01x streak multiplier for each task streak
      } else if (task.streak < 200) {
        streakMultiplier = 2.9 + 0.005 * (task.streak - 100); //2.9x task streak XP multiplier from 100 streak plus 0.005x streak multiplier for each task streak
      } else if (task.streak < 500) {
        streakMultiplier = 3.4 + 0.002 * (task.streak - 200); //3.4x task streak XP multiplier from 200 streak plus 0.002x streak multiplier for each task streak
      } else if (task.streak < 1000) {
        streakMultiplier = 4 + 0.001 * (task.streak - 500); //4x task streak XP multiplier from 500 task streak plus 0.001x streak multiplier for each task streak
      } else if (task.streak < 2000) {
        streakMultiplier = 4.5 + 0.0005 * (task.streak - 1000); //4.5x task streak XP multiplier from 1,000 task streak plus 0.0005x streak multiplier for each task streak
      } else if (task.streak < 5000) {
        streakMultiplier = 5 + 0.0002 * (task.streak - 2000); //5x task streak XP multiplier from 2,000 task streak plus 0.0002x streak multiplier for each task streak
      } else if (task.streak < 10000) {
        streakMultiplier = 5.6 + 0.0001 * (task.streak - 5000); //5.6x task streak XP multiplier from 5,000 task streak plus 0.0001x streak multiplier for each task streak
      } else {
        streakMultiplier = 6.1; //6.1x task streak XP multiplier from 10,000 task streak
      }
      //calculate multiplier based on tasks completed in a day
      if (
        state.user.tasksCompletedToday === 0 ||
        state.user.tasksCompletedToday === 1
      ) {
        dayTasksMultiplier = 1; //1x multiplier for 0 or 1 task completed in a day
      } else if (state.user.tasksCompletedToday < 5) {
        dayTasksMultiplier = 1 + 0.125 * (state.user.tasksCompletedToday - 1); //1x multiplier plus 0.125x multiplier for each task completed in a day from 1 task
      } else if (state.user.tasksCompletedToday < 10) {
        dayTasksMultiplier = 1.5 + 0.1 * (state.user.tasksCompletedToday - 5); //1.5x multiplier plus 0.1x multiplier for each task completed in a day from 5 tasks
      } else if (state.user.tasksCompletedToday < 20) {
        dayTasksMultiplier = 2 + 0.05 * (state.user.tasksCompletedToday - 10); //2x multiplier plus 0.05x multiplier for each task completed in a day from 10 tasks
      } else if (state.user.tasksCompletedToday < 50) {
        dayTasksMultiplier =
          2.5 + 0.025 * (state.user.tasksCompletedToday - 20); //2.5x multiplier plus 0.025x multiplier for each task completed in a day from 20 tasks
      } else if (state.user.tasksCompletedToday < 100) {
        dayTasksMultiplier =
          3.25 + 0.02 * (state.user.tasksCompletedToday - 50); //3.25x multiplier plus 0.02x multiplier for each task completed in a day from 50 tasks
      } else if (state.user.tasksCompletedToday < 200) {
        dayTasksMultiplier =
          4.25 + 0.01 * (state.user.tasksCompletedToday - 100); //4.25x multiplier plus 0.01x multiplier for each task completed in a day from 100 tasks
      } else if (state.user.tasksCompletedToday < 500) {
        dayTasksMultiplier =
          5.25 + 0.005 * (state.user.tasksCompletedToday - 200); //5.25x multiplier plus 0.005x multiplier for each task completed in a day from 200 tasks
      } else if (state.user.tasksCompletedToday < 1000) {
        dayTasksMultiplier =
          6.75 + 0.0025 * (state.user.tasksCompletedToday - 500); //6.75x multiplier plus 0.0025x multiplier for each task completed in a day from 500 tasks
      } else if (state.user.tasksCompletedToday < 2000) {
        dayTasksMultiplier =
          8 + 0.002 * (state.user.tasksCompletedToday - 1000); //8x multiplier plus 0.002x multiplier for each task completed in a day from 1,000 tasks
      } else if (state.user.tasksCompletedToday < 5000) {
        dayTasksMultiplier =
          10 + 0.001 * (state.user.tasksCompletedToday - 2000); //10x multiplier plus 0.001x multiplier for each task completed in a day from 2,000 tasks
      } else if (state.user.tasksCompletedToday < 10000) {
        dayTasksMultiplier =
          13 + 0.0006 * (state.user.tasksCompletedToday - 5000); //13x multiplier plus 0.0006x multiplier for each task completed in a day from 5,000 tasks
      } else {
        dayTasksMultiplier = 16; //16x multiplier from 10,000 tasks completed in a day
      }
      //calculate level score multiplier based on user level
      if (state.user.level === 0 || state.user.level === 1) {
        levelMultiplier = 1; //1x level score multiplier if user level is 0 or 1
      } else if (state.user.level < 3) {
        levelMultiplier = 1 + 0.1 * (state.user.level - 1); //1x level score multiplier from level 1 plus 0.1x level score multiplier for each level
      } else if (state.user.level < 5) {
        levelMultiplier = 1.2 + 0.05 * (state.user.level - 3); //1.2x level score multiplier from level 3 plus 0.05x level score multiplier for each level
      } else if (state.user.level < 10) {
        levelMultiplier = 1.3 + 0.04 * (state.user.level - 5); //1.3x level score multiplier from level 5 plus 0.04x level score multiplier for each level
      } else if (state.user.level < 20) {
        levelMultiplier = 1.5 + 0.03 * (state.user.level - 10); //1.5x level score multiplier from level 1 plus 0.03x level score multiplier for each level
      } else if (state.user.level < 50) {
        levelMultiplier = 1.8 + 0.02 * (state.user.level - 20); //1.8x level score multiplier from level 20 plus 0.02x level score multiplier for each level
      } else if (state.user.level < 100) {
        levelMultiplier = 2.4 + 0.012 * (state.user.level - 50); //2.4x level score multiplier from level 50 plus 0.012x level score multiplier for each level
      } else if (state.user.level < 200) {
        levelMultiplier = 3 + 0.01 * (state.user.level - 100); //3x level score multiplier from level 100 plus 0.01x level score multiplier for each level
      } else if (state.user.level < 300) {
        levelMultiplier = 4 + 0.005 * (state.user.level - 200); //4x level score multiplier from level 200 plus 0.005x level score multiplier for each level
      } else if (state.user.level < 500) {
        levelMultiplier = 4.5 + 0.0025 * (state.user.level - 300); //4.5x level score multiplier from level 300 plus 0.0025x level score multiplier for each level
      } else if (state.user.level < 1000) {
        levelMultiplier = 5 + 0.002 * (state.user.level - 500); //5x level score multiplier from level 500 plus 0.002x level score multiplier for each level
      } else if (state.user.level < 2000) {
        levelMultiplier = 6 + 0.001 * (state.user.level - 1000); //6x level score multiplier from level 1,000 plus 0.001x level score multiplier for each level
      } else if (state.user.level < 5000) {
        levelMultiplier = 7 + 0.0005 * (state.user.level - 2000); //7x level score multiplier from level 2,000 plus 0.0005x level score multiplier for each level
      } else if (state.user.level < 10000) {
        levelMultiplier = 8.5 + 0.0002 * (state.user.level - 5000); //8.5x level score multiplier from level 5,000 plus 0.0002x level score multiplier for each level
      } else {
        levelMultiplier = 9.5; //9.5 level score multiplier from level 10,000
      }
      state.user.totalTasksCompleted++; //increase total tasks completed by 1
      //calculate task score multiplier
      if (
        state.user.totalTasksCompleted === 0 ||
        state.user.totalTasksCompleted === 1
      ) {
        tasksMultiplier = 1; //1x task score multiplier for 1 task completed
      } else if (state.user.totalTasksCompleted < 3) {
        tasksMultiplier = 1 + 0.1 * (state.user.totalTasksCompleted - 1); //1x task score multiplier from 1 task plus 0.1x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 5) {
        tasksMultiplier = 1.2 + 0.05 * (state.user.totalTasksCompleted - 3); //1.2x task score multiplier from 3 tasks plus 0.05x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 10) {
        tasksMultiplier = 1.3 + 0.04 * (state.user.totalTasksCompleted - 5); //1.3x task score multiplier from 5 tasks plus 0.04x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 20) {
        tasksMultiplier = 1.5 + 0.03 * (state.user.totalTasksCompleted - 10); //1.5x task score multiplier from 10 tasks plus 0.03x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 50) {
        tasksMultiplier = 1.8 + 0.02 * (state.user.totalTasksCompleted - 20); //1.8x task score multiplier from 20 tasks plus 0.02x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 100) {
        tasksMultiplier = 2.4 + 0.012 * (state.user.totalTasksCompleted - 50); //2.4x task score multiplier from 50 tasks plus 0.012x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 200) {
        tasksMultiplier = 3 + 0.01 * (state.user.totalTasksCompleted - 100); //3x task score multiplier from 100 tasks plus 0.01x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 500) {
        tasksMultiplier = 4 + 0.005 * (state.user.totalTasksCompleted - 200); //4x task score multiplier from 200 tasks plus 0.005x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 1000) {
        tasksMultiplier = 5.5 + 0.003 * (state.user.totalTasksCompleted - 500); //5.5x task score multiplier from 500 tasks plus 0.003x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 2000) {
        tasksMultiplier = 7 + 0.002 * (state.user.totalTasksCompleted - 1000); //7x task score multiplier from 1,000 tasks plus 0.002x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 5000) {
        tasksMultiplier = 9 + 0.001 * (state.user.totalTasksCompleted - 2000); //9x task score multiplier from 2,000 tasks plus 0.001x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 10000) {
        tasksMultiplier = 12 + 0.0005 * (state.user.totalTasksCompleted - 5000); //12x task score multiplier from 5,000 tasks plus 0.0005x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 20000) {
        tasksMultiplier =
          14.5 + 0.0003 * (state.user.totalTasksCompleted - 10000); //14.5x task score multiplier from 10,000 tasks plus 0.0003x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 50000) {
        tasksMultiplier =
          17.5 + 0.00025 * (state.user.totalTasksCompleted - 20000); //17.5x task score multiplier from 20,000 tasks plus 0.00025x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 100000) {
        tasksMultiplier =
          25 + 0.0001 * (state.user.totalTasksCompleted - 50000); //25x task score multiplier from 50,000 tasks plus 0.0001x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 200000) {
        tasksMultiplier =
          30 + 0.00006 * (state.user.totalTasksCompleted - 100000); //30x task score multiplier from 100,000 tasks plus 0.00006x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 500000) {
        tasksMultiplier =
          36 + 0.00003 * (state.user.totalTasksCompleted - 200000); //36x task score multiplier from 200,000 tasks plus 0.0000x task score multiplier for each task completed
      } else if (state.user.totalTasksCompleted < 1000000) {
        tasksMultiplier =
          45 + 0.00002 * (state.user.totalTasksCompleted - 500000); //45x task score multiplier from 500,000 tasks plus 0.05x task score multiplier for each task completed
      } else {
        tasksMultiplier = 55; //55x task score multiplier from 1,000,000 tasks
      }
      //calculate active task score multiplier
      if (activeTasks === 0 || activeTasks === 1) {
        activeTasksMultiplier = 1; //1x active task score multiplier for 0 or 1 active task
      } else if (activeTasks < 3) {
        activeTasksMultiplier = 1 + 0.25 * (activeTasks - 1); //1x active task score multiplier from 1 active task plus 0.25x active task score multiplier for each active task
      } else if (activeTasks < 5) {
        activeTasksMultiplier = 1.5 + 0.2 * (activeTasks - 3); //1.5x active task score multiplier from 3 active tasks plus 0.2x active task score multiplier for each active task
      } else if (activeTasks < 10) {
        activeTasksMultiplier = 1.9 + 0.12 * (activeTasks - 5); //1.9x active task score multiplier from 5 active tasks plus 0.12x active task score multiplier for each active task
      } else if (activeTasks < 20) {
        activeTasksMultiplier = 2.5 + 0.05 * (activeTasks - 10); //2.5x active task score multiplier from 10 active tasks plus 0.05x active task score multiplier for each active task
      } else if (activeTasks < 50) {
        activeTasksMultiplier = 3 + 0.03 * (activeTasks - 20); //3x active task score multiplier from 20 active tasks plus 0.03x active task score multiplier for each active task
      } else if (activeTasks < 100) {
        activeTasksMultiplier = 3.9 + 0.022 * (activeTasks - 50); //3.9x active task score multiplier from 50 active tasks plus 0.022x active task score multiplier for each active task
      } else if (activeTasks < 200) {
        activeTasksMultiplier = 5 + 0.015 * (activeTasks - 100); //5x active task score multiplier from 100 active tasks plus 0.015x active task score multiplier for each active task
      } else if (activeTasks < 500) {
        activeTasksMultiplier = 6.5 + 0.01 * (activeTasks - 200); //6.5x active task score multiplier from 200 active tasks plus 0.01x active task score multiplier for each active task
      } else if (activeTasks < 1000) {
        activeTasksMultiplier = 9.5 + 0.005 * (activeTasks - 500); //9.5x active task score multiplier from 500 active tasks plus 0.005x active task score multiplier for each active task
      } else if (activeTasks < 2000) {
        activeTasksMultiplier = 12 + 0.004 * (activeTasks - 1000); //12x active task score multiplier from 1,000 active tasks plus 0.004x active task score multiplier for each active task
      } else if (activeTasks < 5000) {
        activeTasksMultiplier = 16 + 0.002 * (activeTasks - 2000); //16x active task score multiplier from 2,000 active tasks plus 0.002x active task score multiplier for each active task
      } else if (activeTasks < 10000) {
        activeTasksMultiplier = 22 + 0.001 * (activeTasks - 5000); //22x active task score multiplier from 5,000 active tasks plus 0.001x active task score multiplier for each active task
      } else {
        activeTasksMultiplier = 27; //27x active task score multiplier from 10,000 active tasks
      }
      //calculate amount of XP earned and points earned when task is completed
      const xp: number = Math.max(
        Math.floor(
          task.difficulty *
            task.priority *
            dateMultiplier *
            repeatMultiplier *
            streakMultiplier *
            dailyStreakMultiplier *
            dayTasksMultiplier
        ),
        1
      ); //get at least 1 XP when the task is completed
      state.user.xp += xp; //get amount of XP earned based on task difficulty, task priority, task due date, task repetition, task streak and daily streak multipliers
      const score: number = Math.max(
        Math.floor(
          task.difficulty *
            task.priority *
            dateMultiplier *
            repeatMultiplier *
            streakMultiplier *
            dailyStreakMultiplier *
            dayTasksMultiplier *
            levelMultiplier *
            tasksMultiplier *
            activeTasksMultiplier
        ),
        1
      ); //get at least 1 point when the task is completed
      state.user.score += score; //get amount of points earned based on task difficulty, task priority, task due date, task repetition, task streak, daily streak and user level multipliers
      alert(
        `Task ${task.task} completed!\nYou earned ${xp.toLocaleString(
          "en-US"
        )} XP!\nYou earned ${score.toLocaleString("en-US")} points!`
      ); //alert user to show how many XP they earned and points earned after completing the task
      //check if user has leveled up
      const userLevel: number = state.user.level; //set userLevel variable before calculating user level state
      state.user.level = Math.max(
        1,
        Math.floor(Math.pow(state.user.xp, 1 / 3 + 5e-16))
      ); //calculate level based on how many XP and set level to 1 if total XP is 0
      if (state.user.level > userLevel) {
        alert(
          `Level Up!\nYou are now level ${state.user.level.toLocaleString(
            "en-US"
          )}!`
        ); //alert user when user levels up
      }
      state.user.progress =
        ((state.user.xp -
          Math.pow(state.user.level === 1 ? 0 : state.user.level, 3)) /
          (Math.pow(state.user.level + 1, 3) -
            Math.pow(state.user.level === 1 ? 0 : state.user.level, 3))) *
        100; //calculate level progress and if level is 1 set total XP at the start of level 1 to 0 XP
    },
    create_Todo: (state, payload) => {
      /**
       * Create the task when user presses the Add Todo button.
       */
      const createTask = {
        newId: payload.newId as number,
        task: payload.task as string,
        dueDate: payload.dueDate as Date,
        priority: payload.priority as number,
        difficulty: payload.difficulty as number,
        xp: payload.xp as number,
        completed: payload.completed as boolean,
        repeatOften: payload.repeatOften as number,
        repeatFrequency: payload.repeatFrequency as number,
        timesCompleted: payload.timesCompleted as number,
        streak: payload.streak as number,
        originalDueDate: payload.originalDueDate as Date,
      };
      state.todos.unshift(createTask);
    },
    complete_Todo: (state, payload) => {
      /**
       * Complete the task when user presses the Complete button.
       */
      const item = state.todos.find(
        (todo: { newId: number }) => todo.newId === payload
      );
      if (Number(item.repeatFrequency) === 5) {
        //if task is a one-time only
        item.completed = !item.completed; //complete task item (set completed task to true)
      } else {
        item.timesCompleted++; //increment number of times task has been completed by 1
        if (Number(item.repeatFrequency) === 1) {
          //if task repeat frequency is daily
          const newDueDate: Date = new Date(
            new Date(item.originalDueDate + " 23:59:59.999").setDate(
              new Date(item.originalDueDate + " 23:59:59.999").getDate() +
                item.timesCompleted * item.repeatOften
            )
          ); //get new due date
          const adjustedNewDueDate: Date = new Date(
            newDueDate.setMinutes(
              newDueDate.getMinutes() - newDueDate.getTimezoneOffset()
            )
          ); //convert to local timezone
          item.dueDate = adjustedNewDueDate.toISOString().split("T")[0]; //convert due date to YYYY-MM-DD string
        } else if (Number(item.repeatFrequency) === 2) {
          //if task repeat frequency is weekly
          const newDueDate: Date = new Date(
            new Date(item.originalDueDate + " 23:59:59.999").setDate(
              new Date(item.originalDueDate + " 23:59:59.999").getDate() +
                item.timesCompleted * item.repeatOften * 7
            )
          );
          const adjustedNewDueDate: Date = new Date(
            newDueDate.setMinutes(
              newDueDate.getMinutes() - newDueDate.getTimezoneOffset()
            )
          );
          item.dueDate = adjustedNewDueDate.toISOString().split("T")[0];
        } else if (Number(item.repeatFrequency) === 3) {
          //if task repeat frequency is monthly
          const monthsAfter: Date = new Date(
            new Date(item.originalDueDate + " 23:59:59.999").setMonth(
              new Date(item.originalDueDate + " 23:59:59.999").getMonth() +
                item.timesCompleted * item.repeatOften
            )
          );
          if (
            monthsAfter.getMonth() !==
            (new Date(item.originalDueDate + " 23:59:59.999").getMonth() +
              item.timesCompleted * item.repeatOften) %
              12
          ) {
            //if task due date is more than days of the month, set to last day of month
            const newDueDate: Date = new Date(
              new Date(item.originalDueDate + " 23:59:59.999").getFullYear(),
              new Date(item.originalDueDate + " 23:59:59.999").getMonth() +
                item.timesCompleted * item.repeatOften +
                1,
              0,
              23,
              59,
              59,
              999
            );
            const adjustedNewDueDate: Date = new Date(
              newDueDate.setMinutes(
                newDueDate.getMinutes() - newDueDate.getTimezoneOffset()
              )
            );
            item.dueDate = adjustedNewDueDate.toISOString().split("T")[0];
          } else {
            const newDueDate: Date = new Date(
              new Date(item.originalDueDate + " 23:59:59.999").getFullYear(),
              new Date(item.originalDueDate + " 23:59:59.999").getMonth() +
                item.timesCompleted * item.repeatOften,
              new Date(item.originalDueDate + " 23:59:59.999").getDate(),
              23,
              59,
              59,
              999
            );
            const adjustedNewDueDate: Date = new Date(
              newDueDate.setMinutes(
                newDueDate.getMinutes() - newDueDate.getTimezoneOffset()
              )
            );
            item.dueDate = adjustedNewDueDate.toISOString().split("T")[0];
          }
        } else if (Number(item.repeatFrequency) === 4) {
          //if task repeat frequency is yearly
          const yearsAfter: Date = new Date(
            new Date(item.originalDueDate + " 23:59:59.999").setFullYear(
              new Date(item.originalDueDate + " 23:59:59.999").getFullYear() +
                item.timesCompleted * item.repeatOften
            )
          );
          if (
            yearsAfter.getMonth() !==
            new Date(item.originalDueDate + " 23:59:59.999").getMonth()
          ) {
            //if task due date don't have leap year, set task due date to February 28
            const newDueDate: Date = new Date(
              new Date(item.originalDueDate + " 23:59:59.999").getFullYear() +
                item.timesCompleted * item.repeatOften,
              new Date(item.originalDueDate + " 23:59:59.999").getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            );
            const adjustedNewDueDate: Date = new Date(
              newDueDate.setMinutes(
                newDueDate.getMinutes() - newDueDate.getTimezoneOffset()
              )
            );
            item.dueDate = adjustedNewDueDate.toISOString().split("T")[0];
          } else {
            const newDueDate: Date = new Date(
              new Date(item.originalDueDate + " 23:59:59.999").getFullYear() +
                item.timesCompleted * item.repeatOften,
              new Date(item.originalDueDate + " 23:59:59.999").getMonth(),
              new Date(item.originalDueDate + " 23:59:59.999").getDate(),
              23,
              59,
              59,
              999
            );
            const adjustedNewDueDate: Date = new Date(
              newDueDate.setMinutes(
                newDueDate.getMinutes() - newDueDate.getTimezoneOffset()
              )
            );
            item.dueDate = adjustedNewDueDate.toISOString().split("T")[0];
          }
        }
      }
    },
    delete_Todo: (state, payload) => {
      /**
       * Delete the task when user confirms task deletion alert after pressing the Delete button.
       */
      const index = state.todos.findIndex(
        (todo: { newId: number }) => todo.newId === payload
      );
      let deleteTask;
      if (!state.todos[index].completed) {
        //don't ask for confirmation when one-time task is completed
        deleteTask = confirm(
          `Do you want to delete the task ${state.todos[index].task}?\nThis action cannot be undone.`
        ) as boolean; //ask user to confirm task deletion
      }
      if (deleteTask || state.todos[index].completed) {
        //delete task if one-time task is completed when the delete button is clicked or when user confirms deletion alert
        state.todos.splice(index, 1); //delete task item
      }
    },
    setUser: (state, user) => {
      state.user = user; //set user data
    },
    setTodos: (state, todos) => {
      state.todos = todos; //set todos data
    },
  },
  actions: {
    createTask: (context, payload) => {
      /**
       * Action to create the task.
       */
      context.commit("create_Todo", payload);
    },
    completeTask: (context, payload) => {
      /**
       * Action to complete the task.
       */
      context.commit("updateXp", payload);
      context.commit("complete_Todo", payload);
    },
    deleteTask: (context, payload) => {
      /**
       * Action to delete the task.
       */
      context.commit("delete_Todo", payload);
    },
    saveUser(context, user) {
      /**
       * Action to save user data to local storage.
       * @param user the user data
       */
      localStorage.setItem("user", JSON.stringify(user)); //save user data
      context.commit("setUser", user);
    },
    loadUser(context) {
      /**
       * Action to load user data from local storage.
       */
      const user = JSON.parse(localStorage.getItem("user") as string); //load user data
      if (user) {
        context.commit("setUser", user);
      }
    },
    saveTodos(context, todos) {
      /**
       * Action to save task list data to local storage.
       * @param todos the task list data
       */
      localStorage.setItem("todos", JSON.stringify(todos)); //save task list data
      context.commit("setTodos", todos);
    },
    loadTodos(context) {
      /**
       * Action to load task list data to local storage.
       */
      const todos = JSON.parse(localStorage.getItem("todos") as string); //load task list data
      if (todos) {
        context.commit("setTodos", todos);
      }
    },
  },
  modules: {},
  plugins: [createPersistedState()], //create persisted state and save the data to local storage
});
