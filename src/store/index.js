/*
 * @Description:
 * @Version: 2.0
 * @Autor: shiXl
 * @Date: 2021-08-08 17:09:50
 * @LastEditors: shixl shixl@dist.com.cn
 * @LastEditTime: 2024-04-22 22:50:41
 */
import { createStore } from "vuex";
import mutations from "./mutations";
import storage from "../utils/storage";

const state = {
  userInfo: storage.getItem("userInfo") || {}, // 获取用户信息
  menuList: storage.getItem("menuList") || [], // 获取菜单权限
  actionList: storage.getItem("actionList") || [], // 获取菜单按钮权限
  cesiumViewer: null,
  baseMaps: {
    tiandituApiKey: "b7d87c30876f4af87ccd40c1abac5634",
    VECTOR: {
      urlTemplate: "http://t0.tianditu.gov.cn/vec_w/wmts?",
      layer: "vec",
    },
    IMAGE: {
      urlTemplate: "http://t0.tianditu.gov.cn/img_w/wmts?",
      layer: "img",
    },
  },
};
export default createStore({
  state,
  mutations,
});
