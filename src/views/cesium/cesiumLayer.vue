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

    <div id="cesiumContainer"></div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import DataSource from "@/components/DataSource/DataSource.vue";
import BaseMapSwitcher from "@/components/BaseMapSwitcher/BaseMapSwitcher.vue";
import { useStore } from "vuex";
import * as Cesium from "cesium";
import { ininCoordinates } from "@/utils/ConfigFile.js"; // 引入全局白名单

export default {
  name: "CesiumLayer",
  components: {
    DataSource,
    BaseMapSwitcher,
  },
  setup() {
    const viewer = ref(null);
    const isMenuOpen = ref(true); // 默认设置为展开状态
    const store = useStore();
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
        });
        try {
          configureCesium(viewer.value);
          window.cesiumViewer = viewer.value;
          store.commit("setViewer", viewer.value);
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
    };
    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };

    return {
      viewer,
      isMenuOpen,
      toggleMenu,
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
