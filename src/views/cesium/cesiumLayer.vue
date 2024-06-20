<template>
  <div class="cesium-layer">
    <div
      class="menu-toggle-button"
      @click="toggleMenu"
      :class="{ collapsed: !isMenuOpen }"
    >
      <el-icon>
        <component :is="isMenuOpen ? 'arrow-right' : 'arrow-left'" />
      </el-icon>
    </div>
    <div class="left-menu-container" :class="{ collapsed: !isMenuOpen }">
      <DataSource></DataSource>
    </div>
    <BaseMapSwitcher :cesiumViewer="viewer"></BaseMapSwitcher>
    <MapOperation
      :cesiumViewer="viewer"
      :groupedButtons="groupedFunctionButtons"
      @call-parent-method="handleMessageFromChild"
      :parent-method="handleMessageFromChild"
    />
    <div id="cesiumContainer"></div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import DataSource from "@/components/DataSource/DataSource.vue"; // 资源目录
import BaseMapSwitcher from "@/components/BaseMapSwitcher/BaseMapSwitcher.vue"; // 地图开关
import MapOperation from "@/components/MapOperation/MapOperation.vue"; // 地图操作
import { useStore } from "vuex";
import { ininCoordinates } from "@/utils/ConfigFile.js"; // 引入全局白名单

export default {
  name: "CesiumLayer",
  components: {
    DataSource,
    BaseMapSwitcher,
    MapOperation,
  },
  setup() {
    const viewer = ref(null);
    const isMenuOpen = ref(true); // 默认设置为展开状态
    const store = useStore();
    const groupedFunctionButtons = reactive([
      {
        title: "基础操作",
        resources: [
          {
            id: "draw-1",
            label: "绘制点",
            platForm: "draw",
            drawType: "point",
            layerUrl: "",
            layerType: "",
            tk: "",
            ifAdjust: false,
          },
          {
            id: "draw-11",
            label: "绘制点billboard",
            platForm: "draw",
            drawType: "billboard",
            layerUrl: "",
            layerType: "",
            tk: "",
            ifAdjust: false,
            des: `pick方法用于从给定的屏幕坐标（通常是鼠标点击位置）拾取场景中的第一个可见图形元素（如实体、地形、3D Tiles特性等;\npickPosition方法则更专注于将屏幕坐标转换为地球表面的实际三维坐标（世界坐标系中的位置），主要用于获取地形或3D Tiles的表面位置`,
          },
          {
            id: "draw-2",
            label: "绘制线",
            platForm: "draw",
            drawType: "polyline",
            layerUrl: "",
            layerType: "",
            tk: "",
            ifAdjust: false,
          },
          {
            id: "draw-3",
            label: "绘制面",
            platForm: "draw",
            drawType: "polygon",
            layerUrl: "",
            layerType: "",
            tk: "",
            ifAdjust: false,
          },
        ],
        des: "这种主要考查对cesium中事件的控制  以及callbackProperty的使用",
        backgroundColor: "rgba(96, 172, 94, 0.9)",
        isOpen: false,
      },
      {
        title: "绘制操作",
        resources: [
          {
            id: "screen-1",
            label: "分屏对比",
            platForm: "screen",
            drawType: "compare",
            layerUrl: "",
            layerType: "",
            tk: "",
            ifAdjust: false,
          },
          {
            id: "screen-2",
            label: "卷帘对比",
            platForm: "screen",
            drawType: "roller",
            layerUrl: "",
            layerType: "",
            tk: "",
            ifAdjust: false,
          },
        ],
        des: "",
        backgroundColor: " rgba(108, 126, 185, 0.7)",
        isOpen: false,
      },
    ]);
    onMounted(async () => {
      const container = document.getElementById("cesiumContainer");
      if (container) {
        viewer.value = new Cesium.Viewer(container, {
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
        });
        try {
          configureCesium(viewer.value);
        } catch (error) {
          console.error("Cesium configuration failed:", error);
        }
      } else {
        console.error("Cesium container element not found!");
      }
    });
    const configureCesium = async (viewer) => {
      viewer._cesiumWidget._creditContainer.style.display = "none"; // 隐藏版权信息
      viewer.scene.fxaa = false; // 改善实体的文字和图片清晰度
      viewer.scene.globe.maximumScreenSpaceError = 4 / 3; // 降低性能提供图片质量
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
      store.commit("setViewer", viewer);
      Window.viewer = viewer;
    };
    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };
    const handleMessageFromChild = (DataSource) => {
      console.log(DataSource, "0-0-=0-=00-");
    };
    return {
      viewer,
      isMenuOpen,
      toggleMenu,
      groupedFunctionButtons,
      handleMessageFromChild,
    };
  },
};
</script>

<style lang="scss" scoped>
.cesium-layer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden; // 防止内容溢出

  .menu-toggle-button {
    z-index: 2; // 确保按钮在菜单之上
    background-color: rgba(255, 255, 255, 0.5);
    padding: 5px;
    cursor: pointer;
    border-radius: 50%;
    position: absolute;
    left: 0; /* 修改为与左侧菜单容器边界对齐 */
    top: 50%;
    transform: translateY(-50%) translateX(200px); /* 当菜单展开时，将其移至菜单右侧边缘 */
    transition: transform 0.3s ease; /* 添加过渡效果 */

    i {
      font-size: 20px;
    }
    &:hover {
      background-color: rgba(108, 126, 185, 0.7);
    }
    &.collapsed {
      transform: translateY(-50%) translateX(0);
    }
  }

  .left-menu-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 200px; // 菜单宽度
    height: 100%;
    transition: left 0.3s ease; // 动画效果
    padding: 2px;
    &.collapsed {
      left: -200px; // 收起时移到左侧屏幕外
    }
  }

  #cesiumContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%; // 初始宽度为100%
    height: 100%;
    background-color: transparent; // 确保背景色透明，不会显示白色框
    transition: left 0.3s ease;
    .left-menu-container.collapsed ~ & {
      left: 0;
      width: 100%; // 菜单收起时，宽度仍然为100%
    }
  }
}
</style>
