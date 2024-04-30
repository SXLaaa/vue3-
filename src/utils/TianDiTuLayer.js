// TianDiTuLayer.js
const Cesium = window.Cesium;

class TianDiTuLayerLoader {
  constructor(urls, tk, viewer) {
    this.urls = Array.isArray(urls) ? urls : [urls, urls];
    this.tk = tk;
    this.viewer = viewer;
    this.tiandituMainLayer = null;
    this.tiandituAnnotationLayer = null;
  }

  manageTianDiTuLayers(type) {
    if (!this.viewer) {
      console.error("LayerLoader-错误参数");
      return;
    }

    this.removeTianDiTuLayers();

    const createLayerProvider = (url, layerName, format = "image/png") => {
      if (typeof url === "string") {
        const urlWithTk =
          url.replace("{s}", "01234567"[Math.floor(Math.random() * 8)]) +
          "&tk=" +
          this.tk;
        return new Cesium.WebMapTileServiceImageryProvider({
          url: urlWithTk,
          layer: layerName,
          style: "default",
          format,
          tileMatrixSetID: "w",
          maximumLevel: 18,
        });
      } else {
        console.error("Invalid URL template provided.");
        return null;
      }
    };

    let mainLayerProvider, annotationLayerProvider;

    switch (type) {
      case "vector":
        mainLayerProvider = createLayerProvider(this.urls[0], "vec");
        annotationLayerProvider = createLayerProvider(this.urls[1], "cva");
        break;
      case "raster":
        mainLayerProvider = createLayerProvider(this.urls[0], "img");
        annotationLayerProvider = createLayerProvider(this.urls[1], "cia");
        break;
      case "影像":
        mainLayerProvider = createLayerProvider(
          this.urls[0],
          "img",
          "image/jpeg"
        );
        break;
      default:
        console.warn(`Unsupported layer type for TianDiTu: ${type}`);
        return;
    }

    if (mainLayerProvider) {
      const mainLayer = new Cesium.ImageryLayer(mainLayerProvider);
      this.viewer.imageryLayers.add(mainLayer);
      this.tiandituMainLayer = mainLayer;
      this.viewer.imageryLayers.raiseToTop(mainLayer);
    }

    if (annotationLayerProvider) {
      const annotationLayer = new Cesium.ImageryLayer(annotationLayerProvider);
      this.viewer.imageryLayers.add(annotationLayer, 1);
      this.tiandituAnnotationLayer = annotationLayer;
    }
  }

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

export default TianDiTuLayerLoader;
