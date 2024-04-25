<template>
  <div class="resource-directory-container">
    <el-menu
      class="fixed-menu resource-directory"
      :default-active="activeIndex"
      :default-openeds="openedMenus"
      text-color="#333"
      active-text-color="#409EFF"
      mode="vertical"
    >
      <el-submenu
        v-for="(folder, folderIndex) in folders"
        :key="folderIndex"
        :index="folder.index"
        :popper-append-to-body="true"
      >
        <template #title style="display: flex; align-items: center">
          <el-icon><Operation /></el-icon>
          <span>{{ folder.title }}</span>
        </template>

        <el-menu-item
          v-for="(resource, itemIndex) in folder.resources"
          :key="itemIndex"
          :index="resource.index"
          :class="{
            'custom-resource-style': !resource.visible,
            'custom-resource-active-style': resource.visible,
          }"
          style="display: flex; align-items: center"
        >
          <div
            :class="{
              'resource-title': true,
              'resource-title-active': resource.visible,
            }"
          >
            {{ resource.title }}
          </div>
          <el-switch
            style="margin-left: 10px"
            v-model="resource.visible"
            @change="updateResourceVisibility(resource)"
            active-color="#409EFF"
            inactive-color="#ccc"
          />
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import ResourceManager from "@/utils/ResourceManager.js";
export default {
  setup() {
    const activeIndex = ref("");
    const openedMenus = ref(["1"]);
    const folders = ref([
      {
        index: "1",
        title: "土地资源",
        icon: "el-icon-folder",
        resources: [
          {
            index: "1-1",
            layerCode: "37000_sd",
            title: "Geojson",
            layerUrl:
              "https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=370000_full",
            layerName: "",
            platForm: "dataV",
            layerType: "geojson",
            visible: false,
          },
          {
            index: "1-2",
            layerCode: "37001_sd",
            title: "Geojson",
            layerUrl:
              "https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=370009_full",
            layerName: "",
            platForm: "dataV",
            layerType: "geojson",
            visible: false,
          },
        ],
      },
    ]);
    // 获取地图
    const store = useStore();
    const cesiumViewer = computed(() => store.state.cesiumViewer);
    const resourceManagerCall = ref(null);

    onMounted(async () => {
      resourceManagerCall.value = new ResourceManager(
        "DataSource",
        folders.value,
        cesiumViewer
      );
    });
    const updateResourceVisibility = (resource) => {
      resourceManagerCall.value.updateResourceVisibility(resource);
    };
    return {
      folders,
      activeIndex,
      openedMenus,
      resourceManagerCall,
      updateResourceVisibility,
    };
  },
};
</script>

<style scoped lang="scss">
:root {
  --page-bg-color: #000;
  --menu-text-color: #fff;
  --menu-hover-bg-color: rgba(255, 255, 255, 0.5);
  --menu-icon-color: #fff;
  --menu-active-icon-color: #007bff;
  --menu-resource-active-color: red; // 定义一个新的活动资源文本颜色变量
}
.resource-directory-container {
  width: 100%;
  height: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  .fixed-menu {
    width: 100%;
    height: 100%;
    z-index: 999;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    overflow-y: auto;
    .resource-title {
      color: var(--menu-text-color);
    }
    .resource-title-active {
      color: #007bff !important;
    }
  }
}
</style>
<style lang="scss">
// 去掉默认的选中样式
.fixed-menu {
  .el-menu-item.is-active {
    &,
    & > * {
      background-color: transparent !important;
      color: var(--menu-text-color) !important;
      font-weight: normal !important;
      border-left: none !important;
    }
  }
}
</style>
