/*
 * @Description:
 * @Version: 2.0
 * @Autor: shiXl
 * @Date: 2021-08-08 17:09:50
 * @LastEditors: shiXl
 * @LastEditTime: 2021-11-18 23:06:12
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

// console.log("环境变量=>",import.meta.env)
const app = createApp(App);
// 全局指令
app.directive("has", {
  beforeMount: (el, binding) => {
    console.log(el, binding, "===");
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
app.use(router).use(store).use(ElementPlus, { size: "small" }).mount("#app");
