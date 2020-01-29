/*
 * @Descripttion:
 * @Author: voanit
 * @Date: 2020-01-26 20:25:16
 * @LastEditors  : voanit
 * @LastEditTime : 2020-01-27 18:44:48
 */
import Vue from 'vue'
import { Button } from 'element-ui'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.component(Button.name, Button)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
