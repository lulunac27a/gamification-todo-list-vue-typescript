import { createStore } from "vuex";

export default createStore({
  state: {
    todos: [] as any[],
    user: {
      level: 0 as number,
      xp: 0 as number,
      progress: 0 as number,
    },
  },
  getters: {
    getTodos: (state) => state.todos, //get task list
    getXp: (state) => state.user.xp, //get user xp
    getLevel: (state) => state.user.level, //get user level
    getProgress: (state) => state.user.progress, //get user level progress
  },
  mutations: {
    updateXp: (state, payload) => {
      const task = state.todos.find(
        (todo: { newId: number }) => todo.newId === payload
      );
      const daysToDue: number =
        (Number(new Date(task.dueDate + " 23:59:59.999")) -
          Number(new Date().setHours(23, 59, 59, 999))) /
        (1000 * 24 * 60 * 60); //calculate number of days until the task is due
      const dateMultiplier: number =
        daysToDue < 0 ? 0.5 : 1 + 1 / (daysToDue + 1); //if task is overdue, xp multiplier is half the amount, else xp multiplier bonus increases when task gets closer to due date
      let repeatMultiplier: number; //calculate task repetition multiplier based on task repetition occurance and task repetition frequency
      if (task.repeatFrequency == 1) {
        //if task repetition is daily
        if (task.repeatOften < 7) {
          //7 days is 1 week
          repeatMultiplier = 1 + (task.repeatOften - 1) / (7 - 1); //1x xp multiplier for daily tasks (1 day) to 2x xp multiplier for weekly tasks (7 days)
        } else if (task.repeatOften < 30) {
          //approximately 30 days is 1 month
          repeatMultiplier = 2 + (task.repeatOften - 7) / (30 - 7); //2x xp multiplier for weekly tasks (7 days) to 3x xp multiplier for monthly tasks (approximately 30 days)
        } else if (task.repeatOften < 365) {
          //approximately 365 days is 1 year
          repeatMultiplier = 3 + (task.repeatOften - 30) / (365 - 30); //3x xp multiplier for monthly tasks (approximately 30 days) to 4x xp multiplier for yearly tasks (approximately 365 days)
        } else {
          repeatMultiplier = 5 - 365 / task.repeatOften; //4x xp multiplier for yearly tasks (approximately 365 days) to 5x xp multiplier for one-time tasks
        }
      } else if (task.repeatFrequency == 2) {
        //if task repetition is weekly
        if (task.repeatOften < 4) {
          //approximately 4 weeks is 1 month
          repeatMultiplier = 2 + (task.repeatOften - 1) / (4 - 1); //2x xp multiplier for weekly tasks (1 week) to 3x xp multiplier for monthly tasks (approximately 4 weeks)
        } else if (task.repeatOften < 52) {
          //approximately 52 weeks is 1 year
          repeatMultiplier = 3 + (task.repeatOften - 4) / (52 - 4); //3x xp multiplier for monthly tasks (approximately 4 weeks) to 4x xp multiplier for yearly tasks (approximately 52 weeks)
        } else {
          repeatMultiplier = 5 - 52 / task.repeatOften; //4x xp multiplier for yearly tasks (approximately 52 weeks) to 5x xp multiplier for one-time tasks
        }
      } else if (task.repeatFrequency == 3) {
        //if task repetition is monthly
        if (task.repeatOften < 12) {
          //12 months is 1 year
          repeatMultiplier = 3 + (task.repeatOften - 1) / (12 - 1); //3x xp multiplier for monthly tasks (1 month) to 4x xp multiplier for yearly tasks (12 months)
        } else {
          repeatMultiplier = 5 - 12 / task.repeatOften; //4x xp multiplier for yearly tasks (12 months) to 5x xp multiplier for one-time tasks
        }
      } else if (task.repeatFrequency == 4) {
        //if task repetition is yearly
        repeatMultiplier = 5 - 1 / task.repeatOften; //4x xp multiplier for yearly tasks (1 year) to 5x xp multiplier for one-time tasks
      } else {
        //if task repetition is one-time
        repeatMultiplier = 5; //get 5x xp multiplier for one-time tasks
      }
      const xp: number = Math.max(
        Math.floor(
          task.difficulty * task.priority * dateMultiplier * repeatMultiplier
        ),
        1
      ); //get at least 1 xp when the task is completed
      state.user.xp += xp; //get amount of xp earned based on task difficulty, task priority, task due date and task repetition
      state.user.level = Math.floor(Math.pow(state.user.xp, 1 / 3 + 5e-16)); //calculate level based on how many xp
      state.user.progress =
        ((state.user.xp - Math.pow(state.user.level, 3)) /
          (Math.pow(state.user.level + 1, 3) - Math.pow(state.user.level, 3))) *
        100; //calculate level progress
    },
    create_Todo: (state, payload) => {
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
      };
      state.todos.unshift(createTask);
    },
    complete_Todo: (state, payload) => {
      const item = state.todos.find(
        (todo: { newId: number }) => todo.newId === payload
      );
      item.completed = !item.completed; //complete task item
    },
    delete_Todo: (state, payload) => {
      const index = state.todos.findIndex(
        (todo: { newId: number }) => todo.newId === payload
      );
      state.todos.splice(index, 1); //delete task item
    },
    setUser: (state, user) => {
      state.user = user; //set user data
    },
    setTodos: (state, todos) => {
      state.todos = todos; //set user data
    },
  },
  actions: {
    createTask: (context, payload) => {
      context.commit("create_Todo", payload);
    },
    completeTask: (context, payload) => {
      context.commit("complete_Todo", payload);
      context.commit("updateXp", payload);
    },
    deleteTask: (context, payload) => {
      context.commit("delete_Todo", payload);
    },
    saveUser(context, user) {
      localStorage.setItem("user", JSON.stringify(user)); //save user data
      context.commit("setUser", user);
    },
    loadUser(context) {
      const user = JSON.parse(localStorage.getItem("user") as string); //load user data
      if (user) {
        context.commit("setUser", user);
      }
    },
    saveTodos(context, todos) {
      localStorage.setItem("todos", JSON.stringify(todos)); //save task list data
      context.commit("setTodos", todos);
    },
    loadTodos(context) {
      const todos = JSON.parse(localStorage.getItem("todos") as string); //load task list data
      if (todos) {
        context.commit("setTodos", todos);
      }
    },
  },
  modules: {},
});
