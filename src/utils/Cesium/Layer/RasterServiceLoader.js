/**
 * 加载WMS、WMTS（4326,3857,4490）
 * */
import { ininCoordinates } from "@/utils/ConfigFile.js"; // 引入全局白名单
import { destination } from "turf";

class RasterServiceLoader {
  /**
   * 构造函数，初始化服务图层加载器。
   * @param {Cesium.Viewer} viewer - Cesium Viewer实例。
   * @param {Object} serviceOptions - 服务配置选项，包含服务类型、url、图层名称等。
   */
  constructor(viewer, serviceOptions) {
    this.viewer = viewer;
    this.serviceOptions = serviceOptions;
    this.serviceType = serviceOptions.layerType; // 'wms', 'wmts', 'wfs'
    this.layerUrl = serviceOptions.layerUrl;
    this.layerName = serviceOptions.layerName || ""; // 对于WMS/WMTS是必需的，WFS可能不需要
    this.style = serviceOptions.style || ""; // 可选样式
    this.visible = true; // 默认图层可见
    this.layersMap = new Map(); // 使用Map来存储图层
  }

  /**
   * 加载指定类型的服务图层
   * 元数据查看 http://localhost:8089/geoserver/jinan/wms?request=GetCapabilities
   */
  async loadWMSTLayer() {
    if (!this.visible) {
      this.removeLayerByName(this.layerName); // 根据图层名称移除图层
      return;
    }
    switch (this.serviceType) {
      case "wms":
        await this.loadWMS();
        break;
      case "wmts":
        await this.loadWMTS();
        break;
      case "wfs":
        await this.loadWFS();
        break;
      default:
        console.error("不支持的服务类型:", this.serviceType);
        return;
    }
  }

  async loadWMS() {
    if (!this.layerName) {
      console.error("WMS服务需要指定图层名称");
      return;
    }
    const layerWMS = new Cesium.WebMapServiceImageryProvider({
      url: this.layerUrl,
      layers: this.layerName,
      parameters: {
        service: "WMS",
        transparent: true, //背景透明
        format: "image/png",
      },
    });
    this.wmsLayer = this.viewer.imageryLayers.addImageryProvider(layerWMS);
    this.layersMap.set(this.layerName, this.wmsLayer);
    this.viewer.camera.flyTo({
      duration: 1,
      destination: {
        x: -2436337.0664593694,
        y: 4774172.552880386,
        z: 3770735.967068258,
      },
      orientation: {
        heading: 0.05970129550081804,
        pitch: -0.8892836343719246,
        roll: 6.283184413527077,
      },
    });
  }
  async loadWMTS() {
    if (!this.layerName) {
      console.error("WMTS服务需要指定图层名称");
      return;
    }
    let layerWMTS;
    if (this.layerName.includes("3857")) {
      //3857(900913)
      layerWMTS = new Cesium.WebMapTileServiceImageryProvider({
        url: this.layerUrl,
        layer: this.layerName,
        tileMatrixSetID: "EPSG:900913",
        style: "",
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        tileMatrixLabels: [
          "EPSG:900913:0",
          "EPSG:900913:1",
          "EPSG:900913:2",
          "EPSG:900913:3",
          "EPSG:900913:4",
          "EPSG:900913:5",
          "EPSG:900913:6",
          "EPSG:900913:7",
          "EPSG:900913:8",
          "EPSG:900913:9",
          "EPSG:900913:10",
          "EPSG:900913:11",
          "EPSG:900913:12",
          "EPSG:900913:13",
          "EPSG:900913:14",
          "EPSG:900913:15",
          "EPSG:900913:16",
          "EPSG:900913:17",
          "EPSG:900913:18",
        ],
        maximumLevel: 21,
        minimumLevel: 0,
      });
    } else if (this.layerName.includes("4326")) {
      // 4326
      // layerWMTS = new Cesium.WebMapTileServiceImageryProvider({
      //   url: this.layerUrl,
      //   layer: this.layerName,
      //   tileMatrixSetID: "EPSG:4326",
      //   style: "",
      //   tilingScheme: new Cesium.GeographicTilingScheme(),
      //   tileMatrixLabels: [
      //     "EPSG:4326:0",
      //     "EPSG:4326:1",
      //     "EPSG:4326:2",
      //     "EPSG:4326:3",
      //     "EPSG:4326:4",
      //     "EPSG:4326:5",
      //     "EPSG:4326:6",
      //     "EPSG:4326:7",
      //     "EPSG:4326:8",
      //     "EPSG:4326:9",
      //     "EPSG:4326:10",
      //     "EPSG:4326:11",
      //     "EPSG:4326:12",
      //     "EPSG:4326:13",
      //     "EPSG:4326:14",
      //     "EPSG:4326:15",
      //     "EPSG:4326:16",
      //     "EPSG:4326:17",
      //     "EPSG:4326:18",
      //   ],
      //   maximumLevel: 21,
      //   minimumLevel: 0,
      // });
      layerWMTS = new Cesium.WebMapTileServiceImageryProvider({
        url: this.layerUrl,
        layer: this.layerName,
        tileMatrixSetID: "EPSG:4490",
        style: "",
        tilingScheme: new Cesium.GeographicTilingScheme(),
        tileMatrixLabels: [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "11",
          "12",
          "13",
          "14",
          "15",
          "16",
          "17",
          "18",
        ],
        maximumLevel: 18,
        minimumLevel: 0,
      });
    }
    this.wmtsLayer = this.viewer.imageryLayers.addImageryProvider(layerWMTS);
    this.layersMap.set(this.layerName, this.wmtsLayer);
  }

  async loadWFS() {
    if (!this.layerName) {
      console.error("WFS服务需要指定图层名称");
      return;
    }
    const params = {
      service: "WFS",
      version: "1.1.0",
      request: "GetFeature",
      typeName: this.layerName,
      outputFormat: "application/json",
    };
    const requestUrl = `${this.layerUrl}?${new URLSearchParams(
      params
    ).toString()}`;

    try {
      const response = await fetch(requestUrl);
      if (!response.ok) {
        throw new Error(`网络请求错误，状态码：${response.status}`);
      }
      const data = await response.json();
      const geoJsonDataSource = new Cesium.GeoJsonDataSource();
      geoJsonDataSource
        .load(data, {
          clampToGround: true,
        })
        .then(() => {
          // 确保数据已经加载完毕后再进行样式设置和标签添加
          geoJsonDataSource.entities.values.forEach((entity) => {
            // // 设置点的样式（如果有的话）
            // if (entity.point) {
            //   entity.point.pixelSize = 10; // 设置点的大小
            //   entity.point.color = Cesium.Color.RED.withAlpha(0.5); // 设置点的颜色
            // }

            // // 设置多边形的样式（如果有的话）
            // if (entity.polygon) {
            //   entity.polygon.hierarchy = Cesium.Cartesian3.fromDegreesArray(
            //     entity.polygon.hierarchy.map((coord) =>
            //       Cesium.Cartesian3.fromDegrees(...coord)
            //     )
            //   ); // 如果WFS返回的坐标是度分秒，需要转换
            //   entity.polygon.material = Cesium.Color.GREEN.withAlpha(0.5); // 设置多边形的颜色
            //   entity.polygon.outline = true; // 设置轮廓
            //   entity.polygon.outlineColor = Cesium.Color.BLACK; // 设置轮廓颜色
            //   entity.polygon.outlineWidth = 2; // 设置轮廓宽度
            // }

            // // 设置线的样式（如果有的话）
            // if (entity.polyline) {
            //   entity.polyline.width = 2; // 设置线的宽度
            //   entity.polyline.material = Cesium.Color.BLUE; // 设置线的颜色
            // }

            // 添加文本标签（如果属性中存在name）
            if (entity.properties && entity.properties.name) {
              const label = new Cesium.LabelGraphics({
                show: true,
                text: entity.properties.name, // 使用feature的名称属性
                font: "14px sans-serif",
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -10), // 根据需要调整偏移量
              });
              entity.label = label; // 将标签添加到实体上
            }
          });
          // 将数据源添加到场景中
          this.wfsLayer = geoJsonDataSource;
          this.viewer.dataSources.add(geoJsonDataSource);
          this.layersMap.set(this.layerName, geoJsonDataSource);
        });
      // 确保数据源加载成功后再执行飞行动作
      this.viewer.camera.flyTo({
        duration: 1,
        destination: {
          x: -2678321.536523693,
          y: 4653204.407947007,
          z: 3728165.4304584167,
        },
        orientation: {
          heading: 0.05970265576411027,
          pitch: -0.8893020938568181,
          roll: 6.2831826620244255,
        },
      });
    } catch (error) {
      console.error("加载WFS数据失败:", error);
    }
  }
  removeLayerByName(layerName) {
    const layer = this.layersMap.get(layerName);
    if (layer) {
      console.log(`尝试移除图层: ${layerName}`);
      if (layer instanceof Cesium.ImageryLayer) {
        console.log("是ImageryLayer类型，尝试移除...");
        this.viewer.imageryLayers.remove(layer);
      } else if (this.wfsLayer) {
        console.log("是DataSource类型，尝试移除...");
        this.viewer.dataSources.remove(layer);
        this.wfsLayer = null;
      }
      this.layersMap.delete(layerName);
      console.log(`图层 ${layerName} 移除成功`);
    } else {
      console.warn(`图层 ${layerName} 未找到，无法移除`);
    }
  }
}

export default RasterServiceLoader;
