<!--
 * @FilePath: /vue3-koa2-web/src/components/ScaleScaling/ScaleScaling.vue
 * @Author: shixiaolei
 * @Date: 2024-07-03 15:48:18
 * @LastEditTime: 2024-07-07 15:08:18
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
// 获取viewer视图中心
function pickCenter() {
  let viewer = props.viewer;
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
// 放大缩小比例尺 1放大 0缩小
function zoomByBound(flag) {
  const center = pickCenter();
  let viewer = props.viewer;
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
  position: absolute;
  bottom: 12%;
  right: 52%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: column;
  background: white;
  .add {
    width: 40px;
    height: 40px;
    font-size: 26px;
    color: black;
    text-align: center;
    line-height: 40px;
    &:hover {
      background: rgb(66, 61, 61);
      cursor: pointer;
    }
  }
  .reduce {
    width: 40px;
    height: 40px;
    font-size: 26px;
    color: black;
    text-align: center;
    line-height: 40px;
    &:hover {
      background: rgb(66, 61, 61);
      cursor: pointer;
    }
  }
}
</style>
