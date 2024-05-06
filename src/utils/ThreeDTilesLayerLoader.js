// 加载倾斜摄影方法
const Cesium = window.Cesium;

class ThreeDTilesLayerLoader {
  constructor(urls, viewer) {
    this.urls = Array.isArray(urls) ? urls : [urls];
    this.viewer = viewer;
    this.tilesets = []; // 用于存储加载的Cesium3DTileset实例
    this.visible = true; // 默认图层可见
  }

  async load3DTilesLayers() {
    for (const url of this.urls) {
      try {
        const tileset = new Cesium.Cesium3DTileset({ url: url });
        this.viewer.scene.primitives.add(tileset);
        this.tilesets.push(tileset);
        debugger;
        // 监听加载完成事件，以便在加载后执行操作，如自动缩放
        await tileset.readyPromise;
        if (this.visible) {
          this.viewer.zoomTo(tileset);
        }
      } catch (error) {
        console.error(`Failed to load 3D Tiles from ${url}:`, error);
      }
    }
  }

  // 添加方法来控制图层的显隐
  setVisible(flag) {
    if (typeof flag !== "boolean") {
      throw new Error("setVisible method expects a boolean argument.");
    }
    this.visible = flag;
    this.tilesets.forEach((tileset) => {
      tileset.show = flag;
    });
  }
}
export default ThreeDTilesLayerLoader;
