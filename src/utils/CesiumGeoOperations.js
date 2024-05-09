// 基础绘制
import { jinan, qingdao } from "@/utils/ConfigFile.js"; // 引入全局白名单
import billboardImage from "@/assets/images/广告牌识别.png";
class CesiumGeoOperations {
  constructor(viewer, drawType) {
    this.viewer = viewer;
    this.drawType = drawType;
  }
  // 绘制
  drawMethod() {
    switch (this.drawType) {
      case "point":
        this.addPoint(...jinan);
        break;
      case "billboard":
        this.addPointWithBillboardAndLabel(...qingdao);
        break;
      case "line":
        break;
      case "polygon":
        break;
    }
  }
  //绘制点
  addPoint(longitude, latitude, options = {}) {
    // 验证viewer是否已定义
    if (!this.viewer || !this.viewer.entities) {
      throw new Error("Viewer没有定义");
    }
    const defaultOptions = {
      pixelSize: 10, // 像素大小
      color: Cesium.Color.RED, // 颜色
      outlineColor: Cesium.Color.WHITE, // 轮廓颜色
      outlineWidth: 2, // 轮廓宽度
    };
    const mergedOptions = { ...defaultOptions, ...options };
    const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
    const pointEntity = this.viewer.entities.add({
      show: true,
      position: position,
      point: mergedOptions,
    });
    this.viewer.zoomTo(pointEntity);
  }
  addPointWithBillboardAndLabel(
    longitude,
    latitude,
    text = "测试广告牌",
    options = {}
  ) {
    // 验证viewer是否已定义
    if (!this.viewer || !this.viewer.entities) {
      throw new Error("Viewer没有定义");
    }
    // 图标配置
    const defaultBillboardOptions = {
      image: billboardImage,
      width: 32,
      height: 32,
    };
    // Label配置
    const defaultLabelOptions = {
      text: text,
      font: "14pt Arial",
      fillColor: Cesium.Color.WHITE, // 文本颜色
      outlineColor: Cesium.Color.BLACK, // 文本轮廓颜色
      outlineWidth: 2, // 文本轮廓宽度
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // 水平方向位置
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直方向位置
      pixelOffset: new Cesium.Cartesian2(0, -30), // 相对位置偏移x,y
    };
    const mergedBillboardOptions = {
      ...defaultBillboardOptions,
      ...options.billboard,
    };
    const mergedLabelOptions = { ...defaultLabelOptions, ...options.label };
    // 创建点的位置
    const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
    const entity = this.viewer.entities.add(
      new Cesium.Entity({
        position: position,
        billboard: new Cesium.BillboardGraphics(mergedBillboardOptions),
        label: new Cesium.LabelGraphics(mergedLabelOptions),
      })
    );
    this.viewer.zoomTo(entity);
  }
}
export default CesiumGeoOperations;

// // 绘制线
// addLine(coordinates, options = {}) {
//     const defaultOptions = {
//         width: 5,
//         material: new Cesium.PolylineOutlineMaterialProperty({
//             color: Cesium.Color.BLUE,
//             outlineWidth: 2,
//             outlineColor: Cesium.Color.WHITE,
//         }),
//     };
//     const mergedOptions = {...defaultOptions, ...options};
//     const positions = Cesium.Cartesian3.fromDegreesArray(coordinates);
//     const lineEntity = this.viewer.entities.add({
//         polyline: {
//             positions: positions,
//             ...mergedOptions.polyline,
//         },
//     });
//     return lineEntity;
// }

// // 绘制多边形
// addPolygon(coordinates, options = {}) {
//     const defaultOptions = {
//         material: Cesium.Color.GREEN.withAlpha(0.5),
//     };
//     const mergedOptions = {...defaultOptions, ...options};
//     const positions = Cesium.Cartesian3.fromDegreesArray(coordinates);
//     const polygonEntity = this.viewer.entities.add({
//         polygon: {
//             hierarchy: positions,
//             ...mergedOptions.polygon,
//         },
//     });
//     return polygonEntity;
// }

// // 计算两点间距离
// calculateDistance(position1, position2) {
//     return Cesium.Cartesian3.distance(position1, position2);
// }

// // 计算多边形面积（简化版，仅适用于凸多边形）
// calculatePolygonArea(coordinates) {
//     let totalArea = 0.0;
//     const positions = Cesium.Cartesian3.fromDegreesArray(coordinates);
//     const numVertices = positions.length;
//     for (let i = 0; i < numVertices; i++) {
//         const j = (i + 1) % numVertices;
//         totalArea += (positions[i].x + positions[j].x) * (positions[j].y - positions[i].y);
//     }
//     return Math.abs(totalArea / 2.0);
// }
