<!-- 
    # 地图操作方法
 -->
<template>
  <div class="map-operation-container">
    <div class="horizontal-button-list">
      <el-dropdown
        v-for="(group, index) in groupedButtons"
        :key="index"
        trigger="click"
      >
        <span
          class="group-title"
          :title="group.des"
          :style="{ backgroundColor: group.backgroundColor }"
          >{{ group.title }}</span
        >
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(resource, buttonIndex) in group.resources"
              :key="`${index}-${buttonIndex}`"
              @click.stop="handleButtonClick(resource)"
              :title="resource.des"
            >
              {{ resource.label }}
              <el-button
                size="small"
                type="danger"
                @click="handleClear"
                style="float: right"
                >清空绘制</el-button
              >
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<script>
import { ref, onMounted, watch, reactive, toRefs, defineEmits } from "vue";
import CesiumGeoOperations from "@/utils/Cesium/Draw/CesiumGeoOperations";
import turf from "turf";
export default {
  name: "MapOperation",
  props: {
    groupedButtons: {
      type: Array,
      required: true,
      validator(value) {
        return value.every(
          (group) =>
            typeof group.title === "string" &&
            Array.isArray(group.buttons) &&
            group.buttons.every(
              (item) =>
                typeof item.label === "string" &&
                typeof item.action === "function"
            )
        );
      },
    },
    cesiumViewer: {
      type: Object,
      required: true,
      default: () => null,
    },
    parentMethod: Function,
  },
  setup(props, context) {
    // 绘制线操作
    const resourceManagerCall = ref(null);
    let handler = null;
    let viewer = null;
    let dynamicPoint = null; // 鼠标移动的点
    let points = []; // 绘制线形成的点-c3
    let tempPoints = reactive([]); // 两个点动态引导线
    let computeLine = []; // 计算线长度的点-w84
    let drawedShapes = []; // 绘制面形成的图形
    let drawType = "";
    let platForm = "";
    watch(
      () => props.cesiumViewer,
      (newVal, oldVal) => {
        if (newVal && !oldVal) {
          viewer = newVal;
          resourceManagerCall.value = new CesiumGeoOperations(
            props.cesiumViewer
          );
        }
      },
      { immediate: true }
    );
    // 使用 context.emit 而不是 callParentMethod
    const emitCallParentMethod = (resource) => {
      context.emit("call-parent-method", resource);
    };
    const emit = defineEmits(["call-parent-method"]);
    const callParentMethod = (resource) => {
      emit("call-parent-method", resource);
    };
    const handleButtonClick = (resource) => {
      platForm = resource.platForm;
      drawType = resource.drawType;
      // 点线面绘制
      if (platForm == "draw") {
        if (
          resourceManagerCall.value &&
          ["point", "billboard"].includes(drawType)
        ) {
          resourceManagerCall.value.setDrawType(drawType);
        } else {
          startDraw();
        }
        // 分屏对比
      } else if (platForm == "screen") {
        if (["compare"].includes(drawType)) {
          // emitCallParentMethod(resource); // 第一种
          // callParentMethod(resource); // 第二种
          props.parentMethod(resource); // 第三种
        }
      }
    };
    // 监听事件
    const startDraw = () => {
      viewer.camera.flyTo({
        duration: 2,
        destination: Cesium.Cartesian3.fromDegrees(120.464, 37.355, 100000),
        complete: function () {},
      });
      viewer.entities.removeAll(); // 绘制前，先清除所有的
      viewer.scene.globe.depthTestAgainstTerrain = true;
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );
      if (handler) {
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(
          Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        );
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      } else {
        handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      }

      // 左键点击事件
      handler.setInputAction((movement) => {
        let earthPosition = viewer.scene.pickPosition(movement.position);
        if (Cesium.defined(earthPosition)) {
          if (tempPoints.length == 0) {
            dynamicPoint = addLinePoit(earthPosition);
            tempPoints.push(earthPosition);
            drawShape();
          }
          tempPoints.push(earthPosition);
          let clickpoint = addLinePoit(earthPosition);
          points.push(clickpoint);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // 鼠标移动
      handler.setInputAction((e) => {
        if (Cesium.defined(dynamicPoint)) {
          let newPosition = viewer.scene.pickPosition(e.endPosition);
          if (Cesium.defined(newPosition)) {
            dynamicPoint.position.setValue(newPosition);
            tempPoints[tempPoints.length - 1] = newPosition; // 更新最后一个点为鼠标当前位置
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      // 鼠标双击取消绘制
      handler.setInputAction((e) => {
        finalShape();
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(
          Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        );
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    };

    // 创建线的点
    const addLinePoit = (earthPosition) => {
      let point = viewer.entities.add({
        position: earthPosition,
        point: {
          color: Cesium.Color.RED,
          pixelSize: 8,
          depthFailMaterial: new Cesium.Color(1.0, 0.0, 0.0, 0.5), // 设置深度测试失败时的材质
        },
      });
      let computePoint = Cartesian3_to_WGS84(earthPosition);
      computeLine.push([computePoint.lng, computePoint.lat]);
      return point;
    };
    const Cartesian3_to_WGS84 = (point) => {
      let cartesian3 = new Cesium.Cartesian3(point.x, point.y, point.z);
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
      let lat = Cesium.Math.toDegrees(cartographic.latitude);
      let lng = Cesium.Math.toDegrees(cartographic.longitude);
      return {
        lat: lat,
        lng: lng,
      };
    };
    // 绘制线或面
    const drawShape = () => {
      let shape;
      if (drawType === "polyline") {
        shape = viewer.entities.add({
          polyline: {
            positions: new Cesium.CallbackProperty(() => {
              return tempPoints;
            }, false),
            width: 10,
            clampToGround: true,
            material: Cesium.Color.YELLOW,
          },
        });
      } else if (drawType === "polygon") {
        shape = viewer.entities.add({
          polygon: {
            hierarchy: new Cesium.CallbackProperty(() => {
              return new Cesium.PolygonHierarchy(tempPoints);
            }, false),
            clampToGround: true,
            material: Cesium.Color.YELLOW.withAlpha(0.4),
          },
        });
      }
      drawedShapes.push(shape);
    };
    const finalShape = () => {
      for (let i = 0; i < points.length; i++) {
        viewer.entities.remove(points[i]);
      }
      points = [];
      viewer.entities.remove(dynamicPoint);
      dynamicPoint = null;
      getMeasureResult();
    };
    const getMeasureResult = () => {
      switch (drawType) {
        case "polyline":
          let lineString = turf.lineString(computeLine); // 将一组坐标点转换为线串（LineString）地理对象,二维（经度、纬度）
          let length = turf.lineDistance(lineString).toFixed(2); // 计算给定线串的长度（以米为单位）
          let point = computeLine[computeLine.length - 1];
          createLabel(length, point);
          break;
        case "polygon":
          computeLine.push(computeLine[0]);
          let polygon = turf.polygon([computeLine]); // 将坐标数组转换为多边形（Polygon）地理对象
          let area = (turf.area(polygon) / 1000000).toFixed(2); // 计算多边形的面积（以平方米为单位
          let centroid = turf.centroid(polygon); // 计算多边形的几何中心点（质心）
          let center = centroid.geometry.coordinates;
          createLabel(area, center);
          break;
        default:
          break;
      }
    };
    const createLabel = (measureRes, point) => {
      let text, label;
      if (drawType == "polyline") {
        text = measureRes + "km";
      }
      if (drawType == "polygon") {
        text = measureRes + "km²";
      }
      label = viewer.entities.add({
        name: "measureLabel",
        position: Cesium.Cartesian3.fromDegrees(point[0], point[1], 5),
        label: {
          text: text,
          font: "24px Microsoft YaHei",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.WHITE,
          scale: 1,
          showBackground: true,
          backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });
      drawedShapes.push(label);
      viewer.scene.globe.depthTestAgainstTerrain = false;
    };
    // 清空所有绘制
    const handleClear = () => {
      viewer.entities.removeAll();
      dynamicPoint = null; // 动态点击的点
      points = []; // 形成的点-c3
      tempPoints = reactive([]); // 两个点动态划线
      computeLine = []; // 计算线长度的点-w84
      drawedShapes = []; // 最终绘制的图形
    };
    return {
      resourceManagerCall,
      handleButtonClick,
      startDraw,
      addLinePoit,
      Cartesian3_to_WGS84,
      drawShape,
      handleClear,
      emitCallParentMethod,
      emit,
    };
  },
};
</script>

<style scoped lang="scss">
.map-operation-container {
  position: relative;
}

.horizontal-button-list {
  position: absolute;
  top: 20px;
  right: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;

  .group-title {
    color: #efe8e8;
    font-size: 14px;
    font-weight: bold;
    padding: 10px 25px;
    border-radius: 4px;
  }

  .el-dropdown {
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
    .el-dropdown-menu {
      .el-dropdown-item {
        &:hover {
          background-color: #f5f5f5;
        }
      }
    }
  }
}
</style>
