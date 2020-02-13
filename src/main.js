/*
 * @Descripttion:
 * @Author: voanit
 * @Date: 2020-01-26 20:25:16
 * @LastEditors  : yanxu gong
 * @LastEditTime : 2020-02-13 11:51:26
 */
import Vue from 'vue'
import { Button, Table, TableColumn, Progress } from 'element-ui'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.component(Button.name, Button)
Vue.component(Table.name, Table)
Vue.component(TableColumn.name, TableColumn)
Vue.component(Progress.name, Progress)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
