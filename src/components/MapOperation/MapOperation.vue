<!-- 
    # 地图操作方法
 -->
<template>
  <div class="map-operation-container">
    <div class="horizontal-button-list">
      <div
        v-for="(group, index) in groupedButtons"
        :key="index"
        class="button-group"
        @click="toggleGroup(index)"
      >
        <span class="group-title">{{ group.title }}</span>
        <transition name="fade">
          <div
            v-if="group.isOpen"
            class="button-items-dropdown"
            :key="`dropdown-${index}`"
            :style="{
              top: `${getDropdownTop(index)}px`,
              left: `${getDropdownLeft(index)}px`,
            }"
          >
            <button
              v-for="(button, buttonIndex) in group.buttons"
              :key="`${index}-${buttonIndex}`"
              class="button-item"
              @click="handleButtonClick(button.action)"
            >
              {{ button.label }}
            </button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue';

export default {
  name: 'MapOperation',
  props: {
    groupedButtons: {
      type: Array,
      required: true,
      validator(value) {
        return value.every((group) =>
          typeof group.title === 'string' &&
          Array.isArray(group.buttons) &&
          group.buttons.every(item =>
            typeof item.label === 'string' &&
            typeof item.action === 'function'
          )
        );
      },
    },
  },
  },
  setup(props) {
    const groupDropdownRefs = ref([]);

    const toggleGroup = (index) => {
      props.groupedButtons[index].isOpen = !props.groupedButtons[index].isOpen;
    };

    const handleButtonClick = (action) => action();

    const dropdownPositions = ref({});

    const updateDropdownPositions = async () => {
      await nextTick();
      dropdownPositions.value = props.groupedButtons.reduce((acc, group, index) => {
        if (group.isOpen) {
          const element = groupDropdownRefs.value[index];
          if (element) {
            const rect = element.getBoundingClientRect();
            acc[index] = { top: rect.bottom + window.scrollY, left: rect.left };
          }
        }
        return acc;
      }, {});
    };

    const getDropdownTop = (index) => dropdownPositions.value[index]?.top || 0;
    const getDropdownLeft = (index) => dropdownPositions.value[index]?.left || 0;

    onMounted(async () => {
      groupDropdownRefs.value = new Array(props.groupedButtons.length).fill(null);
      await updateDropdownPositions();
    });

    // 监听每个group.isOpen的变化以更新位置
    props.groupedButtons.forEach((_, index) => {
      watch(
        () => props.groupedButtons[index].isOpen,
        isOpen => isOpen && updateDropdownPositions(),
        { immediate: false }
      );
    });

    return {
      toggleGroup,
      handleButtonClick,
      getDropdownTop,
      getDropdownLeft,
      groupDropdownRefs,
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
  top: 20px; // 垂直居中，可能需要配合transform属性
  right: 50%; // 适当的右边距
  transform: translateY(-50%); // 垂直居中
  z-index: 2;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end; // 如果需要按钮列表靠右对齐
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  border-radius: 4px; // 为整个列表添加圆角

  .button-group {
    margin-left: 20px;
    cursor: pointer;
    .group-title {
      color: #333;
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .button-items {
      display: flex;
      .button-item {
        background-color: #fff;
        color: #333;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 8px 16px;
        margin-right: 10px;
        &:hover {
          border-color: #666;
          background-color: #f5f5f5;
          transition: border-color 0.3s ease, background-color 0.3s ease;
        }
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  // 如果需要第一个按钮组左边没有间距
  &:first-child .button-group {
    margin-left: 0;
  }
}

.button-items-dropdown {
  position: absolute;
  min-width: max-content;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 4px;
  z-index: 10;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.7s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
