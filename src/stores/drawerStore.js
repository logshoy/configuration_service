import { defineStore } from 'pinia'

export const useDrawerStore = defineStore('drawer', {
  state: () => ({
    miniState: true,
    isLocked: false,
    drawerOpenRight: true, // Состояние блокировки
    drawerOpenLeft: true,
    search: null, // Состояние блокировки
  }),
  actions: {
    // Установка состояния miniState
    setMiniState(value) {
      if (!this.isLocked) {
        this.miniState = value
      }
    },

    // Блокировка/разблокировка
    lockMiniState(value) {
      this.isLocked = value
    },

    setDrawerOpenRight() {
      this.drawerOpenRight = !this.drawerOpenRight
    },

    setDrawerOpenLeft() {
      this.drawerOpenLeft = !this.drawerOpenLeft
    },

    setSearch(value) {
      this.search = value
    },
  },
})
