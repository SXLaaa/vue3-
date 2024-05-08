/*
 * @Description:
 * @Version: 2.0
 * @Autor: shiXl
 * @Date: 2021-08-08 17:09:50
 * @LastEditors: shiXl
 * @LastEditTime: 2021-11-21 11:26:51
 */
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/lib/theme-chalk/index.css";
import request from "./utils/request";
import api from "./api/index";
import storage from "./utils/storage";
import store from "./store/index";
import keyBoard from "./utils/common";
import * as icons from "@element-plus/icons-vue";
// import * as Cesium from "cesium";
// console.log("环境变量=>",import.meta.env)
const app = createApp(App);
// 全局指令
app.directive("has", {
  beforeMount: (el, binding) => {
    // 获取按钮权限,两种判断方式
    let actionList = storage.getItem("actionList");
    let arg = binding.arg;
    let value = binding.value;
    // 判断是否有标识
    let hasPermission = actionList.includes(value);
    if (!hasPermission) {
      el.style = "display:none";
      setTimeout(() => {
        el.parentNode.removeChild(el);
      }, 0);
    }
  },
});
app.config.globalProperties.$request = request;
app.config.globalProperties.$api = api;
app.config.globalProperties.$storage = storage;
app.config.globalProperties.$keyBoard = keyBoard;
// window.Cesium = Cesium;
// 注册全局图标
for (let [key, component] of Object.entries(icons)) {
  app.component(key, component);
}
app.use(router).use(store).use(ElementPlus).mount("#app");
