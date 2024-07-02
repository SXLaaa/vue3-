<!--
 * @Author: shixl shixl@dist.com.cn
 * @Date: 2024-07-02 17:06:50
 * @LastEditors: shixiaolei
 * @LastEditTime: 2024-07-02 17:14:31
 * @FilePath: /vue3-koa2-web/src/components/SplitScreenCesium/SplitScreenCesium.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="split-screen-container">
    <div ref="leftCesiumContainer" class="cesium-viewer"></div>
    <div ref="rightCesiumContainer" class="cesium-viewer"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";

const leftCesiumContainer = ref(null);
const rightCesiumContainer = ref(null);

onMounted(() => {
  const viewerLeft = new Cesium.Viewer(leftCesiumContainer.value, {
    animation: false,
    baseLayerPicker: false,
    timeline: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    infoBox: false,
  });
  const viewerRight = new Cesium.Viewer(rightCesiumContainer.value, {
    animation: false,
    baseLayerPicker: false,
    timeline: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    infoBox: false,
  });

  // 同步Camera
  syncCameras(viewerLeft, viewerRight);
});

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
</script>

<style scoped>
.split-screen-container {
  display: flex;
}

.cesium-viewer {
  flex: 1;
  height: 100vh;
}
</style>