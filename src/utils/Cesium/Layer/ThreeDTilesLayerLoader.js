import { ininCoordinates } from "@/utils/ConfigFile.js"; // 引入全局白名单
class ThreeDTilesLayerLoader {
  /**
   * 构造函数，初始化3D Tiles图层加载器。
   * @param {string|string[]} urls - 倾斜摄影数据的URL或URL数组。
   * @param {Cesium.Viewer} viewer - Cesium Viewer实例。
   */
  constructor(viewer, urls, ifAdjust) {
    this.urls = Array.isArray(urls) ? urls : [urls];
    this.viewer = viewer;
    this.tilesets = [];
    this.visible = true; // 默认图层可见
    this.ifAdjust = ifAdjust;
  }

  /**
   * 异步加载3D Tiles图层，并在所有模型加载完成后根据visible状态控制显示。
   */
  async load3DTilesLayers() {
    const promises = this.urls.map(async (url) => {
      try {
        const tileset = await Cesium.Cesium3DTileset.fromUrl(url);
        // 判断是否需要更改模型位置
        if (this.ifAdjust) {
          this.adjustTiles(
            tileset,
            ininCoordinates.longitude,
            ininCoordinates.latitude,
            -100
          );
        }
        this.viewer.scene.primitives.add(tileset);
        this.tilesets.push(tileset);
        return tileset;
      } catch (error) {
        console.error(`Failed to load 3D Tileset from ${url}:`, error);
      }
    });

    try {
      await Promise.all(promises);
      this.tilesets.forEach((tileset) => {
        tileset.show = this.visible; // 在所有模型加载完毕后统一设置显示状态
      });

      if (this.visible && this.tilesets.length > 0) {
        this.viewer.scene.globe.depthTestAgainstTerrain = true;
        this.viewer.zoomTo(
          this.tilesets[0],
          new Cesium.HeadingPitchRange(
            0.0,
            -0.5,
            this.tilesets[0].boundingSphere.radius * 2.0
          )
        );
      }
    } catch (error) {
      console.error("Error loading some or all 3D Tilesets:", error);
    }
  }
  /**
   * 位置调整-模型
   * 经纬度、高度
   */
  adjustTiles(tileset, lon, lat, h) {
    //tileset的包围球中心点坐标从笛卡尔坐标系转换为地理坐标系
    let cartographic = Cesium.Cartographic.fromCartesian(
      tileset.boundingSphere.center
    );
    //根据中心点坐标计算出的地表坐标点
    let surface = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      0.0
    );
    //根据中心点坐标和height值计算出的新的坐标点
    let offset = Cesium.Cartesian3.fromDegrees(lon, lat, h);
    //更新tileset模型矩阵(modelMatrix),实现tileset位置的平移变换
    let translation = Cesium.Cartesian3.subtract(
      offset,
      surface,
      new Cesium.Cartesian3()
    );
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
  }
}

export default ThreeDTilesLayerLoader;
