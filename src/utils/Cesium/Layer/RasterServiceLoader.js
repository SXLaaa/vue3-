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
    this.labelEntities = [];
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
    console.log(
      "🚀 ~ file: RasterServiceLoader.js:35 ~ RasterServiceLoader ~ loadWMSTLayer ~ this.serviceType:",
      this.serviceType
    );

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
    // 获取服务元数据,定位到打开图层的boundingBoxElements
    let aa = await this.getLayerExtentFromCapabilities(
      this.layerUrl,
      this.layerName
    );
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
      layerWMTS = new Cesium.WebMapTileServiceImageryProvider({
        url: this.layerUrl,
        layer: this.layerName,
        tileMatrixSetID: "EPSG:4326",
        style: "",
        tilingScheme: new Cesium.GeographicTilingScheme(),
        tileMatrixLabels: [
          "EPSG:4326:0",
          "EPSG:4326:1",
          "EPSG:4326:2",
          "EPSG:4326:3",
          "EPSG:4326:4",
          "EPSG:4326:5",
          "EPSG:4326:6",
          "EPSG:4326:7",
          "EPSG:4326:8",
          "EPSG:4326:9",
          "EPSG:4326:10",
          "EPSG:4326:11",
          "EPSG:4326:12",
          "EPSG:4326:13",
          "EPSG:4326:14",
          "EPSG:4326:15",
          "EPSG:4326:16",
          "EPSG:4326:17",
          "EPSG:4326:18",
        ],
        maximumLevel: 21,
        minimumLevel: 0,
      });
      // layerWMTS = new Cesium.WebMapTileServiceImageryProvider({
      //   url: this.layerUrl,
      //   layer: this.layerName,
      //   tileMatrixSetID: "EPSG:4490",
      //   style: "",
      //   tilingScheme: new Cesium.GeographicTilingScheme(),
      //   tileMatrixLabels: [
      //     "1",
      //     "2",
      //     "3",
      //     "4",
      //     "5",
      //     "6",
      //     "7",
      //     "8",
      //     "9",
      //     "10",
      //     "11",
      //     "12",
      //     "13",
      //     "14",
      //     "15",
      //     "16",
      //     "17",
      //     "18",
      //   ],
      //   maximumLevel: 18,
      //   minimumLevel: 0,
      // });
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
      let geoJsonDataSource = new Cesium.GeoJsonDataSource();
      geoJsonDataSource
        .load(data, {
          clampToGround: true,
        })
        .then(() => {
          // 确保数据已经加载完毕后再进行样式设置和标签添加
          let entities = geoJsonDataSource.entities.values;
          entities.forEach((entity) => {
            if (entity.polygon) {
              const color = Cesium.Color.fromRandom({ alpha: 1.0 }); // 生成随机颜色
              entity.polygon.material = color;
              // 获取polygon的positions、positions.center
              let positions = entity.polygon.hierarchy.getValue().positions;
              const center = Cesium.BoundingSphere.fromPoints(positions).center;
              // 设置线条
              entity.polyline = {
                positions: positions,
                show: true,
                width: 2,
                // material: Cesium.Color.BLUE,
              };
              // 设置label
              if (positions && Array.isArray(positions)) {
                const labelEntity = new Cesium.Entity({
                  position: center,
                  label: {
                    text: entity.properties?.name || "",
                    font: "12px sans-serif",
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    pixelOffset: new Cesium.Cartesian2(0, -15), //偏移
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // 水平对齐方向
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直对齐方向
                  },
                });
                this.labelEntities.push(labelEntity); //保存实体，方便移除
                this.viewer.entities.add(labelEntity);
              }
            }
          });
          // 将数据源添加到场景中
          this.wfsLayer = geoJsonDataSource;
          this.viewer.dataSources.add(geoJsonDataSource);
          this.layersMap.set(this.layerName, geoJsonDataSource);
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
        });
    } catch (error) {
      console.error("加载WFS数据失败:", error);
    }
  }
  /**
   * 获取wms元数据
   * */
  async getLayerExtentFromCapabilities(url, layerName) {
    const capabilitiesUrl = `${url}?service=WMS&version=1.1.1&request=GetCapabilities`;
    const response = await fetch(capabilitiesUrl);
    const xmlText = await response.text(); //响应体转换为文本格式
    // 创建了一个 DOMParser 实例，并使用其 parseFromString 方法将上一步得到的XML文本解析为一个XML Document对象 (xmlDoc)。
    //   这里，“text/xml”是作为解析器的类型指示，告诉它期望处理的是XML格式的数据
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const layers = xmlDoc.getElementsByTagName("Layer"); // 获取文档下面所有的Layer
    for (let i = 0; i < layers.length; i++) {
      const layerChildNode = layers[i];
      if (
        layerName.includes(layerChildNode.querySelector("Name").textContent)
      ) {
        const boundingBoxElements = layerChildNode.querySelector("BoundingBox");
        let SRSList = "4490,4326";
        const coords = SRSList.includes(
          boundingBoxElements.getAttribute("SRS").split(":")[1]
        )
          ? [
            parseFloat(boundingBoxElements.getAttribute("minx")),
            parseFloat(boundingBoxElements.getAttribute("miny")),
            parseFloat(boundingBoxElements.getAttribute("maxx")),
            parseFloat(boundingBoxElements.getAttribute("maxy")),
          ]
          : // 如果是其他坐标系，可能需要转换为WGS84
          null;
        // coords属性：west, south, east, north
        // 根据给定的西经（west）、南纬（south）、东经（east）和北纬（north）坐标，创建一个表示矩形区域（Rectangle）的对象
        if (coords) {
          let destination = Cesium.Rectangle.fromDegrees(
            coords[0],
            coords[1],
            coords[2],
            coords[3]
          );
          this.viewer.camera.flyTo({
            destination: destination,
            duration: 2.0,
          });
        }
        return coords;
      }
    }
    return null;
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
        this.labelEntities.forEach((entity) => {
          this.viewer.entities.remove(entity);
        });
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
