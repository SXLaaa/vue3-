/**
 * 基础绘制
 * 点
 * 图标
 * 线
 * 面
 * */
import { jinan, qingdao } from "@/utils/ConfigFile.js"; // 引入全局白名单
import EntityClick from "./EntityClick";
import billboardImage from "@/assets/images/广告牌识别.png";
class CesiumGeoOperations {
  constructor(viewer, drawType) {
    this.viewer = viewer;
    this.drawType = drawType;
    // 添加点击事件监听
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
  }
  destroy() {
    // 检查handler是否存在并且未被销毁
    if (this.handler) {
      this.handler.destroy();
      this.handler = undefined;
    }
  }
  // 绘制-动态点击
  onMapClick(movement) {
    // const cartesian = this.viewer.scene.pickPosition(movement.position);
    console.log(
      "🚀 ~ file: CesiumGeoOperations.js:32 ~ CesiumGeoOperations ~ onMapClick ~ this.viewer.scene:",
      this.viewer.scene
    );
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      // 根据drawType执行相应的绘制操作
      switch (this.drawType) {
        case "point":
          this.addPoint(longitude, latitude);
          break;
        case "billboard":
          this.addPointWithBillboardAndLabel(longitude, latitude);
          break;
        case "line":
          break;
        case "polygon":
          break;
        default:
          console.log("未定义的绘制类型");
      }
    }
  }
  // 绘制-静态直接绘制
  // drawMethod() {
  //   switch (this.drawType) {
  //     case "point":
  //       this.addPoint(...jinan);
  //       break;
  //     case "billboard":
  //       this.addPointWithBillboardAndLabel(...qingdao);
  //       break;
  //     case "line":
  //       break;
  //     case "polygon":
  //       break;
  //   }
  // }
  //绘制点
  addPoint(longitude, latitude, options = {}) {
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
  //绘制图标和label
  addPointWithBillboardAndLabel(
    longitude,
    latitude,
    text = "测试广告牌",
    options = {}
  ) {
    const defaultBillboardOptions = {
      image: billboardImage,
      width: 32,
      height: 32,
    };
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

    const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
    const entity = this.viewer.entities.add({
      position,
      billboard: new Cesium.BillboardGraphics({
        ...defaultBillboardOptions,
        ...options.billboard,
      }),
      label: new Cesium.LabelGraphics({
        ...defaultLabelOptions,
        ...options.label,
      }),
    });
    // 缩放至新添加的广告牌
    this.viewer.zoomTo(entity);
    // 点击事件绑定
    // const cliclEvent = new EntityClick(this.viewer);
    // cliclEvent.addClickListenerToEntity(null, "这是广告牌的详细信息");
  }
  // 绘制线
  addLine() {}
  // 添加辅助方法计算所有实体的包围盒
  // calculateEntitiesBoundingBox() {
  //   const entities = this.viewer.entities.values;
  //   let positions = [];
  //   entities.forEach((entity) => {
  //     console.log(
  //       "🚀 ~ file: CesiumGeoOperations.js:89 ~ CesiumGeoOperations ~ entities.forEach ~ entities:",
  //       entities
  //     );
  //     if (entity.position) {
  //       positions.push(entity.position.getValue());
  //     } else if (entity.billboard && entity.billboard.position) {
  //       positions.push(entity.billboard.position.getValue());
  //     } else if (entity.polygon && entity.polygon.hierarchy) {
  //       const hierarchy = entity.polygon.hierarchy.getValue();
  //       if (hierarchy.positions) {
  //         positions = positions.concat(hierarchy.positions);
  //       }
  //     } else if (entity.polyline && entity.polyline.positions) {
  //       const polylinePositions = entity.polyline.positions.getValue();
  //       positions = positions.concat(polylinePositions);
  //     }
  //   });

  //   if (positions.length > 0) {
  //     return Cesium.BoundingSphere.fromPoints(positions);
  //   }
  //   return undefined;
  // }
  // // 修改zoomTo方法以适应所有实体的包围盒
  // zoomToAllEntities() {
  //   const boundingSphere = this.calculateEntitiesBoundingBox();
  //   if (boundingSphere) {
  //     this.viewer.camera.flyToBoundingSphere(boundingSphere, {
  //       duration: 2.0, // 可以调整飞行时间
  //     });
  //   } else {
  //     console.warn("没有实体可以用来缩放视图");
  //   }
  // }
}
export default CesiumGeoOperations;
