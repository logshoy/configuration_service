import { defineStore } from 'pinia'

export const useDrawerStore = defineStore('drawer', {
  state: () => ({
    miniState: true,
    isLocked: false, // Состояние блокировки
  }),
  actions: {
    // Установка состояния miniState
    setMiniState(value) {
      console.log('miniState', this.isLocked)
      if (!this.isLocked) {
        this.miniState = value
      }
    },

    // Блокировка/разблокировка
    lockMiniState(value) {
      this.isLocked = value
      console.log('fgdsf', this.isLocked)
    },
  },
})
