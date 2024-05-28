<template>
  <div class="resource-directory-container">
    <el-menu
      class="fixed-menu resource-directory"
      :default-active="activeIndex"
      :default-openeds="openedMenus"
      text-color="#333"
      active-text-color="#409EFF"
      mode="vertical"
    >
      <el-submenu
        v-for="(folder, folderIndex) in folders"
        :key="folderIndex"
        :index="folderIndex"
        :popper-append-to-body="true"
      >
        <template #title>
          <div>
            <el-icon><Operation /></el-icon>
            <span>{{ folder.title }}</span>
          </div>
        </template>

        <el-menu-item
          v-for="(resource, itemIndex) in folder.resources"
          :key="itemIndex"
          :index="resource.index"
          :class="{
            'custom-resource-style': !resource.visible,
            'custom-resource-active-style': resource.visible,
          }"
          style="display: flex; align-items: center"
        >
          <div
            :title="resource.des"
            :class="{
              'resource-title': true,
              'resource-title-active': resource.visible,
            }"
          >
            {{ resource.title }}
          </div>
          <el-switch
            style="margin-left: 10px"
            v-model="resource.visible"
            @change="updateResourceVisibility(resource)"
            active-color="#409EFF"
            inactive-color="#ccc"
          />
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import ResourceManager from "@/utils/ResourceManager.js";
export default {
  setup() {
    const activeIndex = ref("");
    const openedMenus = ref(["1"]);
    const folders = ref([
      {
        title: "矢量图层",
        icon: "el-icon-folder",
        resources: [
          {
            id: "37000_sd",
            title: "Geojson",
            layerUrl:
              "https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=370000_full",
            layerName: "",
            platForm: "dataV",
            layerType: "geojson",
            visible: false,
            tk: "",
          },
          {
            id: "37001_kml",
            title: "KML",
            layerUrl:
              "https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=370009_full",
            layerName: "",
            platForm: "kml",
            layerType: "kml",
            visible: false,
            tk: "",
            des: "基于xml的标记语言",
          },
        ],
      },
      {
        title: "影像图层",
        icon: "el-icon-folder",
        resources: [
          {
            id: "37004_sd",
            title: "影像",
            layerUrl:
              "https://t{s}.tianditu.gov.cn/img_w/wmts?service=WMTS&request=GetTile&version=1.0.0&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&layer=img",
            layerName: "img",
            platForm: "tianditu",
            layerType: "raster",
            visible: false,
            tk: "b7d87c30876f4af87ccd40c1abac5634",
          },
        ],
      },
      {
        title: "模型",
        icon: "el-icon-folder",
        resources: [
          {
            id: "37005_sd",
            title: "海岛",
            layerUrl:
              "http://localhost:8089/modelData/landTiles/tileset_whole.json",
            layerName: "海岛",
            platForm: "model",
            layerType: "3dTiles",
            visible: false,
            ifAdjust: true, // 是否需要调整位置
            des: "数据来源：D:\apache-tomcat-8.5.82\webapps\modelData",
          },
          {
            id: "37006_sd",
            title: "建筑",
            layerUrl: "http://localhost:8089/modelData/houseTiles/tileset.json",
            layerName: "建筑",
            platForm: "model",
            layerType: "3dTiles",
            visible: false,
            des: "数据来源：D:\apache-tomcat-8.5.82\webapps\modelData",
          },
        ],
      },
      {
        title: "OGC",
        icon: "el-icon-folder",
        resources: [
          {
            id: "37007_sd",
            title: "济南wms服务",
            layerUrl: "http://localhost:8089/geoserver/cite/wms",
            layerName: "cite:jinan",
            platForm: "ogc",
            layerType: "wms",
            visible: false,
            ifAdjust: true, // 是否需要调整位置
            des: "数据来源：D:\Gis数据",
          },
          {
            id: "37008_sd",
            title: "蓬莱水城wms",
            layerUrl: "http://localhost:8089/geoserver/cite/wms",
            layerName: "cite:penglaiwater",
            platForm: "ogc",
            layerType: "wms",
            visible: false,
            des: "数据来源：D:\Gis数据",
          },
          {
            id: "37009_sd",
            title: "济南wmts4326",
            layerUrl:
              "http://localhost:8089/geoserver/gwc/service/wmts/rest/jinan:jinan4326/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=image/png",
            layerName: "jinan:jinan4326",
            platForm: "ogc",
            layerType: "wmts",
            visible: false,
            des: "数据来源D:\Gis数据",
          },
          {
            id: "370010_sd",
            title: "济南wmts3857",
            layerUrl:
              "http://localhost:8089/geoserver/gwc/service/wmts/rest/jinan:jinan3857/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?format=image/png",
            layerName: "jinan:jinan3857",
            platForm: "ogc",
            layerType: "wmts",
            visible: false,
            des: "数据来源：D:\Gis数据",
          },
          {
            id: "370011_sd",
            title: "青岛WFS行政区划",
            layerUrl: "http://localhost:8089/geoserver/qingdao/ows",
            // layerUrl:
            //   "http://localhost:8089/geoserver/qingdao/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=qingdao%3A370200-polygon&maxFeatures=50",
            layerName: "qingdao:370200-polygon",
            platForm: "ogc",
            layerType: "wfs",
            visible: false,
            des: "数据来源：D:\Gis数据",
          },
        ],
      },
    ]);
    // 获取地图
    const store = useStore();
    const cesiumViewer = computed(() => store.state.cesiumViewer);
    const resourceManagerCall = ref(null);

    onMounted(async () => {
      resourceManagerCall.value = new ResourceManager(
        "DataSource",
        folders.value,
        cesiumViewer
      );
    });
    const updateResourceVisibility = (resource) => {
      resourceManagerCall.value.updateResourceVisibility(resource);
    };
    return {
      folders,
      activeIndex,
      openedMenus,
      resourceManagerCall,
      updateResourceVisibility,
    };
  },
};
</script>

<style scoped lang="scss">
:root {
  --page-bg-color: #000;
  --menu-text-color: #fff;
  --menu-hover-bg-color: rgba(255, 255, 255, 0.5);
  --menu-icon-color: #fff;
  --menu-active-icon-color: #007bff;
  --menu-resource-active-color: red; // 定义一个新的活动资源文本颜色变量
}
.resource-directory-container {
  width: 100%;
  height: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  .fixed-menu {
    width: 100%;
    height: 100%;
    z-index: 999;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    overflow-y: auto;
    .resource-title {
      color: var(--menu-text-color);
    }
    .resource-title-active {
      color: #007bff !important;
    }
  }
}
</style>
<style lang="scss">
// 去掉默认的选中样式
.fixed-menu {
  .el-menu-item.is-active {
    &,
    & > * {
      background-color: transparent !important;
      color: var(--menu-text-color) !important;
      font-weight: normal !important;
      border-left: none !important;
    }
  }
}
</style>
