/*
 * @Descripttion:
 * @Author: yanxu gong
 * @Date: 2020-02-21 11:26:15
 * @LastEditors: yanxu gong
 * @LastEditTime: 2020-02-23 14:55:08
 */
import Vue from 'vue'
import { Button, Tree, Upload, Input } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueTreeList from 'vue-tree-list'
import x2js from 'x2js'
import axios from 'axios'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false
Vue.component(Button.name, Button)
Vue.component(Tree.name, Tree)
Vue.component(Upload.name, Upload)
Vue.component(Input.name, Input)
Vue.use(VueTreeList)
Vue.prototype.$x2js = new x2js()
Vue.prototype.$axios = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
