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
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<script>
import { ref, onMounted, watch } from "vue";
import CesiumGeoOperations from "@/utils/Cesium/Draw/CesiumGeoOperations";

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
  },
  setup(props) {
    const resourceManagerCall = ref(null);
    watch(
      () => props.cesiumViewer,
      (newVal, oldVal) => {
        if (newVal && !oldVal) {
          initializeResourceManager();
        }
      },
      { immediate: true }
    );
    onMounted(() => {});
    // viewer初始化成功挂载
    const initializeResourceManager = () => {
      resourceManagerCall.value = new CesiumGeoOperations(props.cesiumViewer);
    };
    const handleButtonClick = (resource) => {
      props.cesiumViewer.entities.removeAll(); // 绘制前，先清除所有的
      // viewer.entities.removeById(entityId); // 根据Id
      // viewer.entities.remove(entityObject); // 根据实体
      resourceManagerCall.value.setDrawType(resource.drawType);
    };
    return {
      resourceManagerCall,
      initializeResourceManager,
      handleButtonClick,
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
