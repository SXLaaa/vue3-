<!--
 * @FilePath: /vue3-koa2-web/src/components/ScaleScaling/ScaleScaling.vue
 * @Author: shixiaolei
 * @Date: 2024-07-03 15:48:18
 * @LastEditTime: 2024-07-03 16:24:32
 * @LastEditors: shixiaolei
 * @Description: 
-->
<template>
  <div class="scale-scaling">
    <div class="add" @click="zoomByBound(1)">+</div>
    <div class="reduce" @click="zoomByBound(0)">-</div>
  </div>
</template>
<script setup>
import { defineProps } from "vue";
const props = defineProps({
  viewer: {
    type: Object,
    required: true,
    default: () => null,
  },
});
function pickCenter() {
  var ellipsoid = viewer.camera.pickEllipsoid(
    new Cesium.Cartesian2(
      viewer.canvas.clientWidth / 2,
      viewer.canvas.clientHeight / 2
    )
  );
  var curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(ellipsoid);
  var lon = (curPosition.longitude * 180) / Math.PI;
  var lat = (curPosition.latitude * 180) / Math.PI;
  return {
    lon: lon,
    lat: lat,
  };
}
function zoomByBound(flag) {
  const center = pickCenter();
  var height = viewer.camera.positionCartographic.height;
  const camera = viewer.camera;
  var boundingSph = new Cesium.BoundingSphere(
    Cesium.Cartesian3.fromDegrees(center.lon, center.lat, 1000),
    height
  );
  var moveRate = 0;
  if (flag) {
    moveRate = 0.5;
  } else {
    moveRate = 1.5;
  }
  var zoomParams = {
    duration: 0.8,
    offset: new Cesium.HeadingPitchRange(
      camera.heading,
      camera.pitch,
      height * moveRate
    ),
  };
  camera.flyToBoundingSphere(boundingSph, zoomParams);
}
</script>
<style lang="scss" scoped>
.scale-scaling {
  padding: 10px 0;
  position: absolute;
  top: 0;
  .add {
    width: 10px;
    height: 10px;
  }
  .reduce {
    width: 10px;
    height: 10px;
    background: white;
    color: black;
  }
}
</style>
