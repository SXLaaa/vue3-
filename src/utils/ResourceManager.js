// ResourceManager.js
import TianDiTuLayerLoader from "./TianDiTuLayer";
import GeoJsonLayerLoader from "./GeoJsonLayerLoader";
import ThreeDTilesLayerLoader from "./ThreeDTilesLayerLoader";

class ResourceManager {
  constructor(componentId, resourcesDirectory, cesiumViewer) {
    this.componentId = componentId;
    this.cesiumViewer = cesiumViewer;
    this.resourceMap = new Map();
    resourcesDirectory.forEach((folder) => {
      folder.resources.forEach((resourceData) => {
        let { platForm, layerUrl, layerType, tk, ifAdjust } = resourceData;
        const key = `${this.componentId}_${resourceData.layerCode}`;
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
        } else {
          console.warn(
            `Unsupported platform or layer layerType: ${platForm}, ${layerType}`
          );
          return;
        }

        this.resourceMap.set(key, layerLoader);
      });
    });
  }

  updateResourceVisibility(resource) {
    if (!resource.layerCode || !resource.layerType || !resource.layerUrl) {
      console.error("无layerCode || 无layerType || 无layerUrl");
      return;
    } else {
      console.info("调用了updateResourceVisibility");
    }

    const key = `${this.componentId}_${resource.layerCode}`;
    const layerLoader = this.resourceMap.get(key);
    if (!layerLoader) {
      console.error(
        `Resource with layerCode "${resource.layerCode}" not found in the resource map.`
      );
      return;
    }
    // 直接设置visible属性，因为具体的加载逻辑现在由各自的Loader类管理
    layerLoader.visible = resource.visible;
    // 根据平台类型调用对应的加载方法
    if (layerLoader instanceof TianDiTuLayerLoader) {
      layerLoader.manageTianDiTuLayers(resource.layerType);
    } else if (layerLoader instanceof GeoJsonLayerLoader) {
      layerLoader.loadGeoJsonLayer();
    } else if (layerLoader instanceof ThreeDTilesLayerLoader) {
      layerLoader.load3DTilesLayers();
    }
  }
}

export default ResourceManager;
