<!--
 * @FilePath: /vue3-koa2-web/src/views/Cesium/RolluAnalysis/RolluAnalysis.vue
 * @Author: shixiaolei
 * @Date: 2024-07-10 16:21:03
 * @LastEditTime: 2024-07-10 17:21:10
 * @LastEditors: shixiaolei
 * @Description: 卷帘分析
-->
<template>
  <div class="cesiumViewer">
    <div ref="CesiumContainer" class="cesium-viewer"></div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ininCoordinates } from "@/utils/ConfigFile.js"; // 引入全局白名单
import ResourceManager from "@/utils/ResourceManager.js";
import ScaleScaling from "@/components/ScaleScaling/ScaleScaling.vue"; // 比例尺缩放

const store = useStore();
const router = useRouter();
const CesiumContainer = ref(null);
const Viewer = ref(null);
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
        visible: true,
        tk: "b7d87c30876f4af87ccd40c1abac5634",
      },
      {
        id: "37004_sd",
        title: "影像",
        layerUrl: [
          "https://t{s}.tianditu.gov.cn/img_w/wmts?service=WMTS&request=GetTile&version=1.0.0&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&layer=img",
        ],
        layerName: "img",
        platForm: "tianditu",
        layerType: "raster",
        visible: true,
        tk: "b7d87c30876f4af87ccd40c1abac5634",
      },
    ],
  },
]);
onMounted(() => {
  let viewerOption = {
    animation: false,
    timeline: false,
    geocoder: false, // 是否显示geocoder小器件，右上角查询按钮
    homeButton: false, // 是否显示Home按钮
    infoBox: false, // 是否显示信息框
    sceneModePicker: false, // 是否显示3D/2D选择器
    navigationHelpButton: false, // 是否显示右上角的帮助按钮
    baseLayerPicker: false, // 是否显示图层选择器
    imageryProvider: false, // cesium默认图层
    selectionIndicator: false, // 实体选中聚焦框
  };
  CesiumContainer.value = new Cesium.Viewer(
    CesiumContainer.value,
    viewerOption
  );
  try {
    configureCesium(CesiumContainer.value);
  } catch (error) {
    console.error("Cesium configuration failed:", error);
  }
});
// 定位到指定坐标
function locationCesium() {
  let viewer = leftViewer.value;
  const initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(
    0.0,
    -90.0,
    0.0
  );
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
      ininCoordinates.longitude,
      ininCoordinates.latitude,
      ininCoordinates.targetHeight
    ),
    orientation: {
      heading: initialOrientation.heading,
      pitch: initialOrientation.pitch,
      roll: initialOrientation.roll,
    },
  });
}
// 加载底图
function configureCesium(viewer) {
  // let leftBolls = new ResourceManager(
  //   "BaseMapSwitcher",
  //   foldersBasemap,
  //   viewer
  // );
  // const rasterResource = foldersBasemap[0].resources.find(
  //   (resource) => resource.layerType === "vector"
  // );
  // leftBolls.updateResourceVisibility({
  //   ...rasterResource,
  // });
}
// 卷帘操作
function vvvv(viewer) {
  viewer.value.imageryLayers.addImageryProvider(
    new Cesium.ArcGisMapServerImageryProvider({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
    })
  );
  // 设置卷帘
  viewer.value.imageryLayers.splitDirection = 1;
  viewer.value.imageryLayers.splitPosition = 0.5;
  // 添加事件监听器，以便用户可以拖动卷帘
  let isDragging = false;
  let startX;
  const screenSpaceHandler = new Cesium.ScreenSpaceEventHandler(
    viewer.value.scene.canvas
  );
  screenSpaceHandler.setInputAction((movement) => {
    console.log("🚀 ~ handleMessageFromChild ~ movement:", movement);
    startX = movement.position.x;
    isDragging = true;
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  screenSpaceHandler.setInputAction((movement) => {
    isDragging = false;
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
  screenSpaceHandler.setInputAction((movement) => {
    console.log("🚀 ~ screenSpaceHandler.setInputAction ~ movement:", movement);
    if (isDragging) {
      const delta = movement.endPosition.x - startX;
      viewer.value.imageryLayers.splitPosition += delta / window.innerWidth;
      startX = movement.startPosition.x;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}
</script>

<style scoped lang="scss">
.cesiumViewer {
  width: 100%;
  height: 100%;
}
.cesium-viewer {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>