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
      dailyStreak: 0 as number, //set daily streak to 0 and last completion date to undefined when state is created
      lastCompletionDate: undefined as string | undefined, //last completion date in YYYY-MM-DD string
    },
  },
  getters: {
    getTodos: (state) => state.todos, //get task list
    getXp: (state) => state.user.xp, //get user XP
    getLevel: (state) => state.user.level, //get user level
    getProgress: (state) => state.user.progress, //get user level progress
    getDailyStreak: (state) => state.user.dailyStreak, //get user daily streak
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
        daysToDue < 0 ? -3 / (daysToDue - 1) : 1 + 1 / (daysToDue + 1); //if task is overdue, XP multiplier is less than 1 that decreases over time when task is overdue, else XP multiplier bonus increases (more than 1) when task gets closer to due date
      let streakMultiplier: number; //calculate task streak XP multiplier based on task streak, if task is completed before the due date then the streak increases else if the task is completed overdue (after the due date) reset task streak to 0
      let repeatMultiplier: number; //calculate task repetition XP multiplier based on task repetition occurrence and task repetition frequency
      let dailyStreakMultiplier: number; //calculate daily streak XP multiplier based on daily streak
      //calculate task repetition XP multiplier
      if (task.repeatFrequency == 1) {
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
      } else if (task.repeatFrequency == 2) {
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
      } else if (task.repeatFrequency == 3) {
        //if task repetition is monthly
        if (task.repeatOften < 12) {
          //12 months is 1 year
          repeatMultiplier = 3 + (task.repeatOften - 1) / (12 - 1); //3x XP multiplier for monthly tasks (1 month) to 4x XP multiplier for yearly tasks (12 months)
        } else {
          repeatMultiplier = 5 - 12 / task.repeatOften; //4x XP multiplier for yearly tasks (12 months) to 5x XP multiplier for one-time tasks
        }
      } else if (task.repeatFrequency == 4) {
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
      const currentDate: Date = new Date();
      if (
        state.user.lastCompletionDate == undefined ||
        new Date(currentDate.setDate(currentDate.getDate() - 1)) >
          new Date(state.user.lastCompletionDate + " 23:59:59.999")
      ) {
        //if user last completion date is before yesterday or undefined (no user task completed yet)
        state.user.dailyStreak = 1; //reset daily streak to 1
      } else if (
        Number(new Date(currentDate.setHours(23, 59, 59, 999))) -
          Number(new Date(state.user.lastCompletionDate + " 23:59:59.999")) ==
        1000 * 60 * 60 * 24
      ) {
        state.user.dailyStreak++; //increase daily streak
      }
      //calculate daily streak XP multiplier
      if (state.user.dailyStreak == (0 || 1)) {
        dailyStreakMultiplier = 1; //1x daily streak XP multiplier if daily streak is 0 or 1
      } else if (state.user.dailyStreak < 3) {
        dailyStreakMultiplier = 1 + 0.1 * (state.user.dailyStreak - 1); //1x daily streak XP multiplier from 1 streak plus 0.1x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 7) {
        //1 week is 7 days
        dailyStreakMultiplier = 1.2 + 0.05 * (state.user.dailyStreak - 3); //1.2x daily streak XP multiplier from 3 streak plus 0.05x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 14) {
        //2 weeks is 14 days
        dailyStreakMultiplier = 1.4 + 0.03 * (state.user.dailyStreak - 7); //1.4x daily streak XP multiplier from 7 streak plus 0.03x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 30) {
        //1 month is approximately 30 days
        dailyStreakMultiplier = 1.61 + 0.02 * (state.user.dailyStreak - 14); //1.61x daily streak XP multiplier from 14 streak plus 0.02x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 90) {
        //3 months is approximately 90 days
        dailyStreakMultiplier = 1.89 + 0.01 * (state.user.dailyStreak - 30); //1.89x daily streak XP multiplier from 30 streak plus 0.01x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 180) {
        //6 months is approximately 180 days
        dailyStreakMultiplier = 2.49 + 0.005 * (state.user.dailyStreak - 90); //2.49x daily streak XP multiplier from 90 streak plus 0.005x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 365) {
        //1 year is approximately 365 days
        dailyStreakMultiplier = 2.94 + 0.002 * (state.user.dailyStreak - 180); //2.94x daily streak XP multiplier from 180 streak plus 0.002x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 730) {
        //2 years is approximately 730 days
        dailyStreakMultiplier = 3.31 + 0.001 * (state.user.dailyStreak - 365); //3.31x daily streak XP multiplier from 365 streak plus 0.001x streak multiplier for each daily streak
      } else if (state.user.dailyStreak < 1461) {
        //4 years is approximately 1461 days
        dailyStreakMultiplier = 3.675 + 0.0005 * (state.user.dailyStreak - 730); //3.675x daily streak XP multiplier from 730 streak plus 0.0005x streak multiplier for each daily streak
      } else {
        dailyStreakMultiplier = 4.0405; //4.0405x daily streak XP multiplier from 365 daily streak
      }
      //set last completion date to today
      state.user.lastCompletionDate = new Date(
        currentDate.setMinutes(
          currentDate.getMinutes() - currentDate.getTimezoneOffset()
        )
      )
        .toISOString()
        .split("T")[0];
      //calculate task streak XP multiplier
      if (task.streak == 0 || task.repeatFrequency == 5) {
        streakMultiplier = 1; //1x task streak XP multiplier if task streak is 0 or completed a one-time task
      } else if (task.streak < 5) {
        streakMultiplier = 1.1 + 0.05 * (task.streak - 1); //1.1x task streak XP multiplier from 1 streak plus 0.05x streak multiplier for each task streak
      } else if (task.streak < 10) {
        streakMultiplier = 1.3 + 0.04 * (task.streak - 5); //1.3x task streak XP multiplier from 5 streak plus 0.04x streak multiplier for each task streak
      } else if (task.streak < 20) {
        streakMultiplier = 1.5 + 0.02 * (task.streak - 10); //1.5x task streak XP multiplier from 10 streak plus 0.02x streak multiplier for each task streak
      } else if (task.streak < 50) {
        streakMultiplier = 1.7 + 0.01 * (task.streak - 20); //1.7x task streak XP multiplier from 20 streak plus 0.01x streak multiplier for each task streak
      } else if (task.streak < 100) {
        streakMultiplier = 2 + 0.005 * (task.streak - 50); //2x task streak XP multiplier from 50 streak plus 0.005x streak multiplier for each task streak
      } else if (task.streak < 200) {
        streakMultiplier = 2.25 + 0.0025 * (task.streak - 100); //2.25x task streak XP multiplier from 100 streak plus 0.0025x streak multiplier for each task streak
      } else if (task.streak < 500) {
        streakMultiplier = 2.5 + 0.001 * (task.streak - 200); //2.5x task streak XP multiplier from 200 streak plus 0.001x streak multiplier for each task streak
      } else if (task.streak < 1000) {
        streakMultiplier = 2.8 + 0.0004 * (task.streak - 500); //2.8x task streak XP multiplier from 500 task streak plus 0.0004x streak multiplier for each task streak
      } else if (task.streak < 2000) {
        streakMultiplier = 3 + 0.00025 * (task.streak - 1000); //3x task streak XP multiplier from 1000 task streak plus 0.00025x streak multiplier for each task streak
      } else if (task.streak < 5000) {
        streakMultiplier = 3.25 + 0.0001 * (task.streak - 2000); //3.25x task streak XP multiplier from 2000 task streak plus 0.0001x streak multiplier for each task streak
      } else if (task.streak < 10000) {
        streakMultiplier = 3.55 + 0.00005 * (task.streak - 5000); //3.55x task streak XP multiplier from 5000 task streak plus 0.00005x streak multiplier for each task streak
      } else {
        streakMultiplier = 3.8; //3.8x task streak XP multiplier from 10000 task streak
      }
      //calculate amount of XP earned when task is completed
      const xp: number = Math.max(
        Math.floor(
          task.difficulty *
            task.priority *
            dateMultiplier *
            repeatMultiplier *
            streakMultiplier *
            dailyStreakMultiplier
        ),
        1
      ); //get at least 1 XP when the task is completed
      state.user.xp += xp; //get amount of XP earned based on task difficulty, task priority, task due date, task repetition, task streak and daily streak multipliers
      alert(`Task ${task.task} completed!\nYou earned ${xp} XP!`); //alert user to show how many XP they earned after completing the task
      //check if user has leveled up
      const userLevel: number = state.user.level; //set userLevel variable before calculating user level state
      state.user.level = Math.max(
        1,
        Math.floor(Math.pow(state.user.xp, 1 / 3 + 5e-16))
      ); //calculate level based on how many XP and set level to 1 if total XP is 0
      if (state.user.level > userLevel) {
        alert(`Level Up!\nYou are now level ${state.user.level}!`); //alert user when user levels up
      }
      state.user.progress =
        ((state.user.xp -
          Math.pow(state.user.level == 1 ? 0 : state.user.level, 3)) /
          (Math.pow(state.user.level + 1, 3) -
            Math.pow(state.user.level == 1 ? 0 : state.user.level, 3))) *
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
      if (item.repeatFrequency == 5) {
        //if task is a one-time only
        item.completed = !item.completed; //complete task item
      } else {
        item.timesCompleted++; //increment number of times task has been completed by 1
        if (item.repeatFrequency == 1) {
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
        } else if (item.repeatFrequency == 2) {
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
        } else if (item.repeatFrequency == 3) {
          const monthsAfter: Date = new Date(
            new Date(item.originalDueDate + " 23:59:59.999").setMonth(
              new Date(item.originalDueDate + " 23:59:59.999").getMonth() +
                item.timesCompleted * item.repeatOften
            )
          );
          if (
            monthsAfter.getMonth() !=
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
        } else {
          const yearsAfter: Date = new Date(
            new Date(item.originalDueDate + " 23:59:59.999").setFullYear(
              new Date(item.originalDueDate + " 23:59:59.999").getFullYear() +
                item.timesCompleted * item.repeatOften
            )
          );
          if (
            yearsAfter.getMonth() !=
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
