<template>
  <div class="basemap-toggle">
    <button @click="toggleBaseMap('vector')">切换到矢量图层</button>
    <button @click="toggleBaseMap('raster')">切换到影像图层</button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import ResourceManager from "@/utils/ResourceManager.js";
import { useStore } from "vuex";

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
let currentVisibleLayer = ref("vector"); // 默认显示矢量图层
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
      (resource) => resource.layerType === "vector"
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

<style scoped>
.basemap-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}
</style>
