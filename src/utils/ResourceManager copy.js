const Cesium = window.Cesium;

class LayerLoader {
  constructor(platForm, type, urls, visible, viewer, tk) {
    this.platForm = platForm;
    this.type = type;
    this.urls = urls;
    this.visible = visible;
    this.viewer = viewer;
    this.tk = tk; // 天地图秘钥
    this.layers = []; // 存储所有加载的图层实例
  }

  load() {
    if (!this.viewer) {
      console.error("LayerLoader-错误参数");
      return;
    }
    console.log(this.platForm, this.visible, this.type, this.urls);

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
  // geoJson加载方法
  loadGeoJsonLayer() {
    if (this.visible) {
      if (!this.dataSource) {
        this.viewer.dataSources
          .add(Cesium.GeoJsonDataSource.load(this.urls[0]))
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
  // 天地图加载方法
  manageTianDiTuLayers(type) {
    this.removeLayers();
    if (this.visible) {
      if (type === "vector" || type === "raster") {
        // 加载矢量图层
        this.loadTianDiTuMainLayer(type);
        // 如果存在第二个URL，加载注记图层
        if (this.urls.length > 1) {
          let type;
          if (type === "vector") type = "cva";
          if (type === "raster") type = "cia";
          this.loadTianDiTuAnnotationLayer(type);
        }
      } else if (type === "annotation") {
        this.loadTianDiTuAnnotationLayer();
      } else {
        console.warn(`Unsupported TianDiTu layer type: ${type}`);
      }
    }
  }

  async loadTianDiTuMainLayer(layerType) {
    const layer = await this.createTianDiTuLayer(layerType);
    if (layer) {
      this.layers.push(layer);
      this.viewer.imageryLayers.raiseToTop(layer);
    }
  }

  async loadTianDiTuAnnotationLayer(annotationType = "cva") {
    if (this.urls.length >= 2) {
      // 确保至少有两个URL，一个为主图层，一个为注记
      const annotationLayer = await this.createTianDiTuLayer(annotationType, true, 1);
      // 使用索引1来获取注记图层URL，并通过参数指定注记类型
      if (annotationLayer) {
        this.layers.push(annotationLayer);
        this.viewer.imageryLayers.raiseToTop(annotationLayer);
      }
    } else {
      console.warn("缺少注记图层的URL");
    }
  }
  async createTianDiTuLayer(layerName, isAnnotation = false, urlIndex = 0) {
    if (this.urls[urlIndex]) {
      const config = {
        url: this.urls[urlIndex] + "&tk=" + this.tk,
        subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
        layer: layerName,
        style: "default",
        format: "image/png",
        tileMatrixSetID: "GoogleMapsCompatible",
        maximumLevel: 18,
      };
      const imageryProvider = new Cesium.WebMapTileServiceImageryProvider(config);
      const imageryLayer = new Cesium.ImageryLayer(imageryProvider);
      this.viewer.imageryLayers.add(imageryLayer, isAnnotation ? 1 : 0);
      return imageryLayer;
    }
    return null;
  }
  removeLayers() {
    this.layers.forEach((layer) => {
      if (layer) {
        this.viewer.imageryLayers.remove(layer);
      }
    });
    this.layers = [];
  }
}

class ResourceManager {
  constructor(componentId, resourcesDirectory, cesiumViewer) {
    this.componentId = componentId;
    this.cesiumViewer = cesiumViewer;
    this.resourceMap = new Map();

    resourcesDirectory.forEach(folder => {
      folder.resources.forEach(resourceData => {
        const key = `${this.componentId}_${resourceData.layerCode}`;
        const urls = Array.isArray(resourceData.layerUrls)
          ? resourceData.layerUrls
          : [resourceData.layerUrl];
        const layerLoader = new LayerLoader(
          resourceData.platForm,
          resourceData.layerType,
          urls,
          resourceData.visible,
          this.cesiumViewer,
          resourceData.tk
        );
        this.resourceMap.set(key, layerLoader);
        // 初始化加载，保证资源按初始状态加载
        layerLoader.load();
      });
    });
  }

  async updateResourceVisibility(resource) {
    const key = `${this.componentId}_${resource.layerCode}`;
    const layerLoader = this.resourceMap.get(key);
    if (!layerLoader) {
      console.error(`Resource with layerCode "${resource.layerCode}" not found.`);
      return;
    }
    try {
      // 更新可见性并重新加载
      layerLoader.visible = resource.visible;
      await layerLoader.load(); // 确保异步加载完成
    } catch (error) {
      console.error(`Error updating visibility for layer ${resource.layerCode}:`, error);
    }
  }
}

export default ResourceManager;