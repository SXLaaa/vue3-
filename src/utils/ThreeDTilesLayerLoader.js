class ThreeDTilesLayerLoader {
  /**
   * 构造函数，初始化3D Tiles图层加载器。
   * @param {string|string[]} urls - 倾斜摄影数据的URL或URL数组。
   * @param {Cesium.Viewer} viewer - Cesium Viewer实例。
   */
  constructor(urls, viewer) {
    this.urls = Array.isArray(urls) ? urls : [urls];
    this.viewer = viewer;
    this.tilesets = [];
    this.visible = true; // 默认图层可见
  }

  /**
   * 异步加载3D Tiles图层，并在所有模型加载完成后根据visible状态控制显示。
   */
  async load3DTilesLayers() {
    const promises = this.urls.map(async (url) => {
      try {
        const tileset = await Cesium.Cesium3DTileset.fromUrl(url);
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
}

export default ThreeDTilesLayerLoader;
