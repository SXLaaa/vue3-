<!--
 * @Author: shixl shixl@dist.com.cn
 * @Date: 2024-07-02 17:06:50
 * @LastEditors: shixiaolei
 * @LastEditTime: 2024-07-07 15:11:00
 * @FilePath: /vue3-koa2-web/src/views/Cesium/SplitScreenCesium/SplitScreenCesium.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="split-screen-container">
    <div class="toolAction">
      <button @click="locationCesium">定位</button>
      <button @click="backHome">返回</button>
    </div>
    <div ref="leftCesiumContainer" class="cesium-viewer"></div>
    <div style="height: 100%; width: 10px; background-color: red"></div>
    <div ref="rightCesiumContainer" class="cesium-viewer"></div>
    <!-- 比例尺组件 -->
    <ScaleScaling :viewer="leftViewer" />
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
const leftCesiumContainer = ref(null);
const rightCesiumContainer = ref(null);
const leftViewer = ref(null);
const rightViewer = ref(null);
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
  leftViewer.value = new Cesium.Viewer(leftCesiumContainer.value, viewerOption);
  rightViewer.value = new Cesium.Viewer(
    rightCesiumContainer.value,
    viewerOption
  );
  try {
    configureCesiumLeft(leftViewer.value);
    configureCesiumRight(rightViewer.value);
  } catch (error) {
    console.error("Cesium configuration failed:", error);
  }
  // 同步Camera
  syncCameras(leftViewer.value, rightViewer.value);
});
// 定位到指定坐标
function locationCesium() {
  let viewer = leftViewer.value;
  const initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(
    0.0,
    -90.0,
    0.0
  ); // 保持默认视角朝向
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
// 左右底图加载
function configureCesiumLeft(viewer) {
  let leftBolls = new ResourceManager(
    "BaseMapSwitcher",
    foldersBasemap,
    viewer
  );
  const rasterResource = foldersBasemap[0].resources.find(
    (resource) => resource.layerType === "raster"
  );
  leftBolls.updateResourceVisibility({
    ...rasterResource,
  });
}

function configureCesiumRight(viewer) {
  let leftBolls = new ResourceManager(
    "BaseMapSwitcher",
    foldersBasemap,
    viewer
  );
  const rasterResource = foldersBasemap[0].resources.find(
    (resource) => resource.layerType === "vector"
  );
  leftBolls.updateResourceVisibility({
    ...rasterResource,
  });
}
// 同步两个视图的Camera
function syncCameras(leftViewer, rightViewer) {
  leftViewer.scene.postRender.addEventListener(function () {
    rightViewer.camera.setView({
      destination: leftViewer.camera.position,
      orientation: {
        heading: leftViewer.camera.heading,
        pitch: leftViewer.camera.pitch,
        roll: leftViewer.camera.roll,
      },
    });
  });
}
function backHome() {
  router.push({
    name: "cesiumLayer",
  });
}
</script>

<style scoped lang="scss">
.split-screen-container {
  display: flex;
  position: relative;
  .toolAction {
    display: flex;
    justify-content: space-between;
    position: absolute;
    top: 20px;
    left: 20px;
    height: 20px;
    width: 200px;
    z-index: 10000;
    background-color: gray;
    button {
      height: 20px;
      width: 80px;
    }
  }
}

.cesium-viewer {
  width: calc(100% - 10px);
  height: 100vh;
}
</style>