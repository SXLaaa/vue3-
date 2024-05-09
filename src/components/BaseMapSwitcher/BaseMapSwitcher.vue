<template>
  <div class="basemap-toggle-container">
    <div
      class="basemap-toggle-button"
      @mouseenter="showButtons = true"
      @mouseleave="showButtons = false"
    >
      <el-icon class="icon-basemap-toggle"><PictureFilled /></el-icon>
      <transition-group name="slide-down" tag="div">
        <div v-show="showButtons" class="basemap-toggle-buttons" key="buttons">
          <div
            class="row"
            v-for="(resource, index) in foldersBasemap[0].resources"
            :key="index"
          >
            <div class="flex-row">
              <span>{{ resource.title }}</span>
              <el-switch
                v-model="resource.visible"
                inline-prompt
                @change="onSwitchChange(resource)"
              />
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, defineProps } from "vue";
import ResourceManager from "@/utils/ResourceManager.js";
const props = defineProps({
  cesiumViewer: {
    type: Object,
    required: true,
    default: () => null,
  },
});
const foldersBasemap = reactive([
  {
    title: "底图",
    icon: "el-icon-folder",
    resources: [
      {
        id: "37003_sd",
        title: "矢量",
        layerUrl: [
          "https://t{s}.tianditu.gov.cn/vec_w/wmts?service=WMTS&request=GetTile&version=1.0.0&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&layer=vec",
          "https://t{s}.tianditu.gov.cn/cva_w/wmts?service=WMTS&request=GetTile&version=1.0.0&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&layer=cva",
        ],
        layerName: "vec",
        platForm: "tianditu",
        layerType: "vector",
        visible: false,
        tk: "b7d87c30876f4af87ccd40c1abac5634",
      },
      {
        id: "37004_sd",
        title: "影像",
        layerUrl: [
          "https://t{s}.tianditu.gov.cn/img_w/wmts?service=WMTS&request=GetTile&version=1.0.0&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&layer=img",
          // "https://t{s}.tianditu.gov.cn/cia_w/wmts?service=WMTS&request=GetTile&version=1.0.0&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&layer=cia",
        ],
        layerName: "img",
        platForm: "tianditu",
        layerType: "raster",
        visible: false,
        tk: "b7d87c30876f4af87ccd40c1abac5634",
      },
    ],
  },
]);
const showButtons = ref(false); // 控制按钮显示隐藏的布尔值
let resourceManagerCall = ref(null); // 获取地图
watch(
  () => props.cesiumViewer,
  (newVal, oldVal) => {
    if (newVal && !oldVal) {
      initializeResourceManager();
    }
  },
  { immediate: true }
);
// 初始化影像地图方法
function initializeResourceManager() {
  console.log(foldersBasemap[0], "初始化viewer");
  resourceManagerCall.value = new ResourceManager(
    "BaseMapSwitcher",
    foldersBasemap,
    props.cesiumViewer
  );
  // 设置矢量图层默认可见
  const rasterResource = foldersBasemap[0].resources.find(
    (resource) => resource.layerType === "raster"
  );
  rasterResource.visible = true;
  resourceManagerCall.value.updateResourceVisibility({
    ...rasterResource,
  });
}
// 切换底图方法
function onSwitchChange(resource) {
  setTimeout(() => {
    resourceManagerCall.value.updateResourceVisibility(resource);
  }, 0);
}
</script>

<style lang="scss" scoped>
.basemap-toggle-container {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

.basemap-toggle-button {
  display: inline-block;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease-in-out;
  z-index: 3;
  position: relative;
  &:hover {
    opacity: 1;
  }
  .icon-basemap-toggle {
    font-size: 30px;
    color: white;
    float: right;
  }

  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.3s ease-in-out;
  }
  .slide-down-enter-from,
  .slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px); /* 或其他合适的位移值 */
  }
  .slide-down-enter-to,
  .slide-down-leave {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 在现有的SCSS样式中加入以下内容 */
.basemap-toggle-buttons .row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  color: white;
  .flex-row {
    display: flex;
    align-items: center;
  }
}
</style>
