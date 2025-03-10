// stores/configurationStore.js
import { defineStore } from 'pinia';

export const useConfigurationStore = defineStore('configuration', {
  state: () => ({
    configurationList: [
      {
        id: 1000398,
        code: 132,
        name: 'dsfadsCoffee-toffee 300 мл',
      },
      {
        id: 1000399,
        code: 133,
        name: 'Coffee-toffee 500 мл',
      },
      {
        id: 1000396,
        code: 130,
        name: 'Toffee 300 мл',
      },
      {
        id: 1000397,
        code: 131,
        name: 'Toffee 500 мл',
      },
      {
        id: 1000394,
        code: 128,
        name: 'Гибкскус. прямые ягоды. специи 300 мл',
      },
      {
        id: 1000395,
        code: 129,
        name: 'Гибкскус. прямые ягоды. специи 500 мл',
      },
      {
        id: 1000395,
        code: 129,
        name: 'Гибкскус. прямые ягоды. специи 500 мл',
      },
      {
        id: 1000395,
        code: 129,
        name: 'Гибкскус. прямые ягоды. специи 500 мл',
      },
      {
        id: 1000395,
        code: 129,
        name: 'Гибкскус. прямые ягоды. специи 500 мл',
      },
      {
        id: 1000395,
        code: 129,
        name: 'Гибкскус. прямые ягоды. специи 500 мл',
      },
      {
        id: 1000395,
        code: 129,
        name: 'Гибкскус. прямые ягоды. специи 500 мл',
      },
      {
        id: 1000395,
        code: 129,
        name: 'Гибкскус. прямые ягоды. специи 500 мл',
      },
      {
        id: 1000395,
        code: 129,
        name: 'Гибкскус. прямые ягоды. специи 500 мл',
      },
    ],

    configuration: null,
  }),
  actions: {
    setConfiguration(newConfiguration) {
      this.configuration = newConfiguration
    },
  },
})
