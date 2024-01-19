import { createStore } from 'vuex'

export default createStore({
  state: {
    todos: [] as any[],
    user: {
      level: 0,
      xp: 0
    },
  },
  getters: {
    getTodos: state => state.todos,//get task list
    getXp: state => state.user.xp,//get user xp
    getLevel: state => state.user.level//get user level
  },
  mutations: {
    addXp: (state, amount: number) => {
      state.user.xp += amount;//add specified amount of xp
    },
    updateXp: (state, payload) => {
      const task = state.todos.find((todo: { newId: number; }) => todo.newId === payload);
      const xp = Math.max(task.difficulty * task.priority, 1);//get at least 1 xp when the task is completed
      state.user.xp += xp;
    },
    create_Todo: (state, payload) => {
      const createTask = {
        newId: payload.newId as number,
        task: payload.task as string,
        dueDate: payload.dueDate as Date,
        priority: payload.priority as number,
        difficulty: payload.difficulty as number,
        xp: payload.xp as number,
        completed: payload.completed as boolean
      };
      state.todos.unshift(createTask);
    },
    complete_Todo: (state, payload) => {
      const item = state.todos.find((todo: { newId: number; }) => todo.newId === payload);
      item.completed = !item.completed;//complete task item
    },
    delete_Todo: (state, payload) => {
      const index = state.todos.findIndex((todo: { newId: number; }) => todo.newId === payload);
      state.todos.splice(index, 1);//delete task item
    },
    setUser: (state, user) => {
      state.user = user;//set user data
    }
  },
  actions: {
    createTodo: (context, payload) => {
      context.commit('create_Todo', payload);
    },
    completeTodo: (context, payload) => {
      context.commit('complete_Todo', payload);
      context.commit('updateXp', payload);
    },
    deleteTodo: (context, payload) => {
      context.commit('delete_Todo', payload);
    },
    saveUser(context, user) {
      localStorage.setItem('user', JSON.stringify(user));//save user data
      context.commit('setUser', user);
    },
    loadUser(context) {
      const user = JSON.parse(localStorage.getItem('user') as string);//load user data
      if (user) {
        context.commit('setUser', user);
      }
    }
  },
  modules: {
  }
});