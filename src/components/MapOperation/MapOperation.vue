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
              @click="handleButtonClick(resource)"
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
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import ResourceManager from "@/utils/ResourceManager.js";
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
  },
  setup(props) {
    const resourceManagerCall = ref(null);
    const store = useStore();
    const cesiumViewer = computed(() => store.state.cesiumViewer);
    onMounted(() => {
      resourceManagerCall.value = new ResourceManager(
        "MapOperation",
        props.groupedButtons,
        cesiumViewer
      );
    });
    const handleButtonClick = (resource) => {
      resourceManagerCall.value.updateResourceVisibility(resource);
    };
    return {
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
