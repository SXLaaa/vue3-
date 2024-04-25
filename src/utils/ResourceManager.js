import * as Cesium from "cesium";

class LayerLoader {
  constructor(platForm, type, url, visible, viewer, tk) {
    this.platForm = platForm;
    this.type = type;
    this.url = url;
    this.visible = visible;
    this.viewer = viewer;
    this.tk = tk; // 天地图秘钥
  }

  load() {
    if (!this.viewer || !this.url) {
      console.error("LayerLoader-错误参数");
      return;
    }

    if (!this.visible) {
      if (this.platForm === "dataV") {
        if (this.dataSource) {
          this.viewer.dataSources.remove(this.dataSource);
          this.dataSource = null;
        }
      } else if (this.platForm === "tianditu") {
        this.viewer.imageryLayers.removeAll();
      }
      return;
    }

    // 当图层需要显示时，根据类型加载图层
    if (this.platForm === "dataV") {
      switch (this.type) {
        case "geojson":
          this.loadGeoJsonLayer();
          break;
      }
    } else if (this.platForm === "tianditu") {
      switch (this.type) {
        case "vector":
          this.loadTianDiTuVectorLayer(this.type);
          break;
        case "raster":
          this.loadTianDiTuVectorLayer(this.type);
          break;
      }
    } else {
      console.warn(`Unknown layer type: ${this.type}`);
    }
  }

  // 新增加载GeoJson矢量图层的方法
  loadGeoJsonLayer() {
    if (this.visible) {
      if (!this.dataSource) {
        this.viewer.dataSources
          .add(Cesium.GeoJsonDataSource.load(this.url))
          .then((dataSource) => {
            this.dataSource = dataSource;
            this.viewer.flyTo(dataSource);
          });
      } else {
        this.viewer.flyTo(this.dataSource);
      }
    }
  }

  // 新增加载天地图矢量底图的方法
  async loadTianDiTuVectorLayer(type) {
    if (this.visible) {
      const addLayerWithProvider = async (
        providerConfig,
        isAnnotationLayer = false
      ) => {
        const imageryProvider = new Cesium.WebMapTileServiceImageryProvider(
          providerConfig
        );
        const imageryLayer = new Cesium.ImageryLayer(imageryProvider);
        this.viewer.imageryLayers.add(imageryLayer, isAnnotationLayer ? 1 : 0);
        return imageryLayer.readyPromise;
      };

      let mainLayerPromise;
      let annotationLayerPromise;

      switch (type) {
        case "vector":
          mainLayerPromise = addLayerWithProvider({
            url: this.url[0] + "&tk=" + this.tk,
            subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
            layer: "vec",
            style: "default",
            format: "image/png",
            tileMatrixSetID: "GoogleMapsCompatible",
            maximumLevel: 18,
          });

          annotationLayerPromise = addLayerWithProvider(
            {
              url: this.url[1] + "&tk=" + this.tk,
              subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
              layer: "cva",
              style: "default",
              format: "image/png",
              tileMatrixSetID: "GoogleMapsCompatible",
              maximumLevel: 18,
              isAnnotationLayer: true,
            },
            true
          );
          break;

        case "raster":
          mainLayerPromise = addLayerWithProvider({
            url: this.url[0] + "&tk=" + this.tk,
            subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
            layer: "img",
            style: "default",
            format: "image/png",
            tileMatrixSetID: "GoogleMapsCompatible",
            maximumLevel: 18,
          });

          annotationLayerPromise = addLayerWithProvider(
            {
              url: this.url[1] + "&tk=" + this.tk,
              subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
              layer: "cia",
              style: "default",
              format: "image/png",
              tileMatrixSetID: "GoogleMapsCompatible",
              maximumLevel: 18,
              isAnnotationLayer: true,
            },
            true
          );
          break;

        default:
          console.warn(`Unknown TianDiTu layer type: ${type}`);
          return;
      }

      await Promise.all([mainLayerPromise, annotationLayerPromise]);
    } else {
      this.viewer.imageryLayers.removeAll();
    }
  }
}

class ResourceManager {
  constructor(componentId, resourcesDirectory, cesiumViewer) {
    this.componentId = componentId;
    this.cesiumViewer = cesiumViewer;
    this.resourceMap = new Map();

    resourcesDirectory.forEach((folder) => {
      folder.resources.forEach((resourceData) => {
        const key = `${this.componentId}_${resourceData.layerCode}`;
        const layerLoader = new LayerLoader(
          resourceData.platForm,
          resourceData.layerType,
          resourceData.layerUrl,
          resourceData.visible,
          this.cesiumViewer,
          resourceData.tk
        );
        this.resourceMap.set(key, layerLoader);
      });
    });

    console.log(this.componentId, this.resourceMap);
  }

  updateResourceVisibility(resource) {
    if (!resource.layerCode || !resource.layerType || !resource.layerUrl) {
      console.error("无layerCode || 无layerType || 无layerUrl");
      return;
    }
    const key = `${this.componentId}_${resource.layerCode}`;
    const layerLoader = this.resourceMap.get(key);
    if (!layerLoader) {
      console.error(
        `Resource with layerCode "${resource.layerCode}" not found in the resource map.`
      );
      return;
    }
    layerLoader.visible = resource.visible;
    layerLoader.load();
  }
}

export default ResourceManager;
