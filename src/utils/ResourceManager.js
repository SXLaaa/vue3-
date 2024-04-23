import * as Cesium from "cesium";

class LayerLoader {
  constructor(platForm, type, url, visible, viewer, tk) {
    this.platForm = platForm;
    this.type = type;
    this.url = url;
    this.visible = visible;
    this.viewer = viewer;
    this.dataSource = null;
    this.tk = tk; // 天地图秘钥
  }

  load() {
    console.log(this.url, "load-url");
    if (!this.viewer || !this.url) {
      console.error("LayerLoader-错误参数");
      return;
    }

    if (!this.visible) {
      if (this.dataSource) {
        this.viewer.dataSources.remove(this.dataSource);
        this.dataSource = null;
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
    } else {
      if (this.dataSource) {
        this.viewer.dataSources.remove(this.dataSource);
        this.dataSource = null;
      }
    }
  }
  // 新增加载天地图矢量底图的方法
  async loadTianDiTuVectorLayer(type) {
    this.viewer.imageryLayers.removeAll();
    const addLayerWithProvider = async (
      providerConfig,
      isAnnotationLayer = false
    ) => {
      const imageryProvider = new Cesium.WebMapTileServiceImageryProvider(
        providerConfig
      );
      const imageryLayer = new Cesium.ImageryLayer(imageryProvider);
      this.viewer.imageryLayers.add(imageryLayer, isAnnotationLayer ? 1 : 0); // 注记图层放在上面
      return imageryLayer.readyPromise;
    };

    if (this.visible) {
      if (!this.dataSource) {
        let mainLayerPromise; // 服务
        let annotationLayerPromise; // 注记

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
        // 保存当前已加载的数据源
        this.dataSource = [...this.viewer.imageryLayers._layers]; // 注意：这里假设 _layers 是 ImageryLayerCollection 内部维护的 layers 数组，实际使用时请参考 Cesium API 文档
      }
    } else {
      this.dataSource = null;
      this.viewer.imageryLayers.removeAll();
    }
  }
}

class ResourceManager {
  constructor(componentId, resourcesDirectory, cesiumViewer) {
    this.componentId = componentId;
    this.cesiumViewer = cesiumViewer;
    this.resourceMap = new Map();
    // 遍历资源目录下每一层的资源项
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
