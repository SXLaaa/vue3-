<template>
  <div class="basemap-toggle-container">
    <div
      class="basemap-toggle-button"
      @mouseenter="showButtons = true"
      @mouseleave="showButtons = false"
    >
      <el-icon class="icon-basemap-toggle"><PictureFilled /></el-icon>
      <transition-group name="slide-down" tag="div">
        <div
          v-if="showButtons"
          class="basemap-toggle-buttons slide-down-container"
          key="buttons"
        >
          <button @click="toggleBaseMap('vector')">切换到矢量图层</button>
          <el-icon><Open /></el-icon>
          <button @click="toggleBaseMap('raster')">切换到影像图层</button>
          <el-icon><Open /></el-icon>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import ResourceManager from "@/utils/ResourceManager.js";
import { useStore } from "vuex";
let showButtons = ref(false); // 控制按钮显示隐藏的布尔值
const folders = ref([
  {
    index: "1",
    title: "底图",
    icon: "el-icon-folder",
    resources: [
      {
        index: "1-2",
        layerCode: "37003_sd",
        title: "矢量底图",
        layerUrl: [
          "https://t{s}.tianditu.gov.cn/vec_w/wmts?service=WMTS&request=GetTile&version=1.0.0&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&layer=vec",
          "https://t{s}.tianditu.gov.cn/cva_w/wmts?service=WMTS&request=GetTile&version=1.0.0&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&layer=cva",
        ],
        layerName: "",
        platForm: "tianditu",
        layerType: "vector",
        visible: false,
        dataSource: undefined,
        tk: "d5b0f0ba1b63b838c65918dfeaf53eb7",
      },
      {
        index: "1-3",
        layerCode: "37004_sd",
        title: "影像底图",
        layerUrl: [
          "https://t{s}.tianditu.gov.cn/img_w/wmts?service=WMTS&request=GetTile&version=1.0.0&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&layer=img",
          "https://t{s}.tianditu.gov.cn/cia_w/wmts?service=WMTS&request=GetTile&version=1.0.0&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&layer=cia",
        ],
        layerName: "",
        platForm: "tianditu",
        layerType: "raster",
        visible: false,
        dataSource: undefined,
        tk: "d5b0f0ba1b63b838c65918dfeaf53eb7",
      },
    ],
  },
]);
// 获取地图
let resourceManagerCall = ref(null);
const store = useStore();
let currentVisibleLayer = ref("raster"); // 默认显示矢量图层
onMounted(async () => {
  setTimeout(() => {
    console.log("Cesium Viewer已初始化完成，开始加载资源...");
    resourceManagerCall.value = new ResourceManager(
      "BaseMapSwitcher",
      folders.value,
      store.state.cesiumViewer
    );
    // 设置矢量图层默认可见
    const vectorResource = folders.value[0].resources.find(
      (resource) => resource.layerType === "raster"
    );
    resourceManagerCall.value.updateResourceVisibility({
      ...vectorResource,
      visible: true,
    });
  }, 0);
});

// 切换底图方法
function toggleBaseMap(layerType) {
  const targetResource = folders.value[0].resources.find(
    (resource) => resource.layerType === layerType
  );
  if (!targetResource) {
    console.error(`找不到对应于${layerType}图层的资源`);
    return;
  }

  currentVisibleLayer.value = layerType; // 更新当前显示的图层

  resourceManagerCall.value.updateResourceVisibility({
    ...targetResource,
    visible: true,
  });

  // 隐藏当前可见图层（这里可以简化，因为仅存在两个图层且已知layerCode）
  const oldVisibleResource = folders.value[0].resources.find(
    (resource) => resource.layerCode !== targetResource.layerCode
  );
  resourceManagerCall.value.updateResourceVisibility({
    ...oldVisibleResource,
    visible: false,
  });
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
  }

  .slide-down-container {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 100%;
    background: #fff; // 下拉框背景颜色
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15); // 下拉框阴影效果
    border-radius: 4px;
    padding: 10px;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease-in-out;

    &.v-enter-active,
    &.v-leave-active {
      transition: all 0.3s ease-in-out;
    }

    &.v-enter-to,
    &.v-leave {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .slide-down-enter-active,
  .slide-down-leave-active {
    position: absolute;
  }
  .button-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}
</style>
