// GeoJsonLayerLoader.js
class GeoJsonLayerLoader {
  constructor(urls, viewer) {
    this.urls = Array.isArray(urls) ? urls : [urls];
    this.viewer = viewer;
    this.dataSource = null;
  }

  loadGeoJsonLayer() {
    if (!this.viewer) {
      console.error("LayerLoader-错误参数");
      return;
    }

    if (this.visible) {
      // 如果已有数据源，先移除
      if (Array.isArray(this.dataSource)) {
        this.dataSource.forEach((dataSource) => {
          this.viewer.dataSources.remove(dataSource, true);
        });
        this.dataSource = null;
      } else if (this.dataSource) {
        this.viewer.dataSources.remove(this.dataSource, true);
        this.dataSource = null;
      }

      let promises = [];
      // 根据urls的类型加载数据
      this.urls.forEach((url) => {
        promises.push(Cesium.GeoJsonDataSource.load(url));
      });

      // 使用Promise.all等待所有加载完成
      Promise.all(promises)
        .then((dataSources) => {
          this.dataSource = dataSources; // 保存所有数据源
          dataSources.forEach((dataSource) => {
            this.viewer.dataSources.add(dataSource);
          });
          if (dataSources.length > 0) {
            this.viewer.flyTo(dataSources[dataSources.length - 1]);
          }
        })
        .catch((error) => {
          console.error("加载GeoJSON图层时发生错误:", error);
        });
    } else {
      // 隐藏或移除图层时的清理工作
      if (Array.isArray(this.dataSource)) {
        this.dataSource.forEach((dataSource) => {
          this.viewer.dataSources.remove(dataSource, true);
        });
      } else if (this.dataSource) {
        this.viewer.dataSources.remove(this.dataSource, true);
      }
      this.dataSource = null;
    }
  }
}

export default GeoJsonLayerLoader;
