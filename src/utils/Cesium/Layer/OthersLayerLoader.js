import { ininCoordinates } from "@/utils/ConfigFile.js"; // 引入全局白名单
class OthersLayerLoader {
  /**
   * 构造函数，初始化KML图层加载器。
   * @param {string|string[]} urls - 倾斜摄影数据的URL或URL数组。
   * @param {Cesium.Viewer} viewer - Cesium Viewer实例。
   */
  constructor(viewer, urls) {
    this.urls = Array.isArray(urls) ? urls : [urls];
    this.viewer = viewer;
    this.visible = true; // 默认图层可见
  }

  /**
   * 异步加载KML图层，并在所有模型加载完成后根据visible状态控制显示。
   */
  async loadLayer() {
    console.log(this.resource, "-=-=-====-=resource");
    let { viewer } = this;
    // 加载KML文件
    try {
      viewer.dataSources
        .add(Cesium.KmlDataSource.load("../../../../public/test.kml"))
        .then(function (dataSource) {
          console.log(
            "🚀 ~ file: OthersLayerLoader.js:24 ~ OthersLayerLoader ~ dataSource:",
            dataSource
          );
          viewer.clock.shouldAnimate = false;
          const rider = dataSource.entities.getById("tour");
          viewer.flyTo(rider).then(function () {
            viewer.trackedEntity = rider;
            viewer.selectedEntity = viewer.trackedEntity;
            viewer.clock.multiplier = 30;
            viewer.clock.shouldAnimate = true;
          });
        });
    } catch (error) {
      console.error("加载KML文件时出错:", error);
    }
  }
}

export default OthersLayerLoader;
