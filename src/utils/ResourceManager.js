const Cesium = window.Cesium;

class LayerLoader {
  constructor(platForm, type, url, visible, viewer, tk) {
    this.platForm = platForm;
    this.type = type;
    this.url = url;
    this.visible = visible;
    this.viewer = viewer;
    this.tk = tk; // 天地图秘钥
    this.tiandituMainLayer = null; // 存储天地图主图层实例
    this.tiandituAnnotationLayer = null; // 存储天地图注记图层实例
  }

  load() {
    if (!this.viewer || !this.url) {
      console.error("LayerLoader-错误参数");
      return;
    }
    console.log(this.platForm, this.visible, this.type, this.url);
    if (this.platForm === "dataV" && this.type === "geojson") {
      this.loadGeoJsonLayer();
    } else if (this.platForm === "tianditu") {
      this.manageTianDiTuLayers(this.type);
    } else {
      console.warn(
        `Unknown layer type: ${this.type} or unsupported platform: ${this.platForm}`
      );
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
    } else if (this.dataSource) {
      this.viewer.dataSources.remove(this.dataSource);
      this.dataSource = null;
    }
  }
  // 新增加载天地图底图的方法
  manageTianDiTuLayers(type) {
    if (this.visible) {
      this.loadTianDiTuLayers(type);
    } else {
      this.removeTianDiTuLayers();
    }
  }
  async loadTianDiTuLayers(type) {
    let mainLayer;
    let annotationLayer;

    const addLayerWithProvider = async (
      providerConfig,
      isAnnotationLayer = false
    ) => {
      const imageryProvider = new Cesium.WebMapTileServiceImageryProvider(
        providerConfig
      );
      const imageryLayer = new Cesium.ImageryLayer(imageryProvider);
      this.viewer.imageryLayers.add(imageryLayer, isAnnotationLayer ? 1 : 0);
      return imageryLayer;
    };

    switch (type) {
      case "vector":
        mainLayer = await addLayerWithProvider({
          url: this.url[0] + "&tk=" + this.tk,
          subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
          layer: "vec",
          style: "default",
          format: "image/png",
          tileMatrixSetID: "GoogleMapsCompatible",
          maximumLevel: 18,
        });

        annotationLayer = await addLayerWithProvider(
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
        mainLayer = await addLayerWithProvider({
          url: this.url[0] + "&tk=" + this.tk,
          subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
          layer: "img",
          style: "default",
          format: "image/png",
          tileMatrixSetID: "GoogleMapsCompatible",
          maximumLevel: 18,
        });

        annotationLayer = await addLayerWithProvider(
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

    // 直接保存加载好的图层实例
    this.tiandituMainLayer = mainLayer;
    this.tiandituAnnotationLayer = annotationLayer;
  }

  // 新增移除天地图矢量底图的方法
  removeTianDiTuLayers() {
    if (this.tiandituMainLayer) {
      this.viewer.imageryLayers.remove(this.tiandituMainLayer);
      this.tiandituMainLayer = null;
    }
    if (this.tiandituAnnotationLayer) {
      this.viewer.imageryLayers.remove(this.tiandituAnnotationLayer);
      this.tiandituAnnotationLayer = null;
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
    layerLoader.visible = resource.visible;
    layerLoader.load();
  }
}

export default ResourceManager;
