<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import mapboxgl from "mapbox-gl";

// 设置你的 Mapbox 访问令牌
mapboxgl.accessToken =
  "pk.eyJ1Ijoib25lbm8xIiwiYSI6ImNrOXYzNW11djA4YWozZXA4cGdlZnQ0bWEifQ.o5X3wJhdM0I_PXekRrOxhg"; // 周亮亮token

const mapContainer = ref(null);
let map = null;

onMounted(() => {
  // map = new mapboxgl.Map({
  //   container: mapContainer.value,
  //   style: "mapbox://styles/mapbox/streets-v12",
  //   center: [120.38129, 36.06711],
  //   zoom: 12,
  //   interactive: true, // 确保地图可以交互
  // });
  map = new mapboxgl.Map({
    container: mapContainer.value, // 存放地图的容器id
    style: "mapbox://styles/mapbox/streets-v12",
    center: [120.38129, 36.06711],
    zoom: 2.5, // 地图缩放等级
    projection: "globe", // 投影方式，默认 'globe'
  });
  map._logoControl && map.removeControl(map._logoControl);
  // 可以在这里添加更多的地图交互和功能
  const controlContainer = map
    .getContainer()
    .querySelector(".mapboxgl-ctrl-bottom-right");
  if (controlContainer) {
    // 隐藏整个控件容器
    controlContainer.style.display = "none";
  }
});

onUnmounted(() => {
  if (map) {
    map.remove();
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%; /* 根据需要调整高度 */
}
</style>
