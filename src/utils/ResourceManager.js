// ResourceManager.js
import TianDiTuLayerLoader from "./Cesium/Layer/TianDiTuLayer";
import GeoJsonLayerLoader from "./Cesium/Layer/GeoJsonLayerLoader";
import ThreeDTilesLayerLoader from "./Cesium/Layer/ThreeDTilesLayerLoader";
import OthersLayerLoader from "./Cesium/Layer/OthersLayerLoader";
import RasterServiceLoader from "./Cesium/Layer/RasterServiceLoader";

class ResourceManager {
  constructor(componentId, resourcesDirectory, cesiumViewer) {
    this.componentId = componentId;
    this.cesiumViewer = cesiumViewer;
    this.resourceMap = new Map();
    resourcesDirectory.forEach((folder) => {
      folder.resources.forEach((resourceData) => {
        let { platForm, layerUrl, layerType, drawType, tk, ifAdjust } =
          resourceData;
        const key = `${this.componentId}_${resourceData.id}`;
        let layerLoader;

        if (platForm === "tianditu") {
          layerLoader = new TianDiTuLayerLoader(cesiumViewer, layerUrl, tk);
        } else if (platForm === "dataV" && layerType === "geojson") {
          layerLoader = new GeoJsonLayerLoader(cesiumViewer, layerUrl);
        } else if (platForm === "model") {
          layerLoader = new ThreeDTilesLayerLoader(
            cesiumViewer,
            layerUrl,
            ifAdjust
          );
        } else if (platForm === "kml") {
          layerLoader = new OthersLayerLoader(cesiumViewer, layerUrl);
        } else if (platForm === "ogc") {
          layerLoader = new RasterServiceLoader(cesiumViewer, resourceData);
        } else {
          console.warn(
            `Unsupported platform or layer layerType: ${platForm}, ${layerType}`
          );
          return;
        }
        this.resourceMap.set(key, layerLoader);
      });
    });
    console.log(
      "🚀 ~ file: ResourceManager.js:43 ~ ResourceManager ~ folder.resources.forEach ~ this.resourceMap:",
      this.resourceMap
    );
  }

  updateResourceVisibility(resource) {
    if (
      (!resource.id || !resource.layerType || !resource.layerUrl) &&
      resource.platForm !== "draw"
    ) {
      console.error("无id || 无layerType || 无layerUrl");
      return;
    } else {
      console.info("调用了updateResourceVisibility");
    }

    const key = `${this.componentId}_${resource.id}`;
    const layerLoader = this.resourceMap.get(key);
    if (!layerLoader) {
      console.error(` this.resourceMap没注册${resource.id}`);
      return;
    }
    // 直接设置visible属性，因为具体的加载逻辑现在由各自的Loader类管理
    layerLoader.visible = resource.visible;
    layerLoader.resource = resource;
    // 根据平台类型调用对应的加载方法
    if (layerLoader instanceof TianDiTuLayerLoader) {
      layerLoader.manageTianDiTuLayers(resource.layerType);
    } else if (layerLoader instanceof GeoJsonLayerLoader) {
      layerLoader.loadGeoJsonLayer();
    } else if (layerLoader instanceof ThreeDTilesLayerLoader) {
      layerLoader.load3DTilesLayers();
    } else if (layerLoader instanceof OthersLayerLoader) {
      layerLoader.loadLayer();
    } else if (layerLoader instanceof RasterServiceLoader) {
      layerLoader.loadWMSTLayer();
    }
  }
}

export default ResourceManager;
