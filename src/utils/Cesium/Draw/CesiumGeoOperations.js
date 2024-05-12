/**
 * 基础绘制
 * 点
 * 图标
 * 线
 * 面
 * */
import { jinan, qingdao } from "@/utils/ConfigFile.js"; // 引入全局白名单
import EntityClick from "./EntityClick"; // 待使用
import billboardImage from "@/assets/images/广告牌识别.png";
class CesiumGeoOperations {
  constructor(viewer) {
    this.viewer = viewer;
    // 添加点击事件监听
    // 重要！！！！！！！！！
    this.viewer.scene.globe.depthTestAgainstTerrain = true; // 场景中的几何体（如点、线、面等）能够正确显示在地形之上或之下
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    this.setupClickHandler();
  }
  // 设置绘制类型
  setDrawType(drawType) {
    this.drawType = drawType;
  }
  // 设置底图监听回调事件
  setupClickHandler() {
    this.handler.setInputAction((movement) => {
      // 使用 drillPick 获取所有可能的实体+判断是否有这个实体
      const pickedEntities = this.viewer.scene.pick(movement.position);
      if (Cesium.defined(pickedEntities) && pickedEntities.id) {
        this.showDetailInfo();
      } else {
        this.onMapClick(movement);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  destroy() {
    if (this.handler) {
      this.handler.destroy();
      this.handler = undefined;
    }
  }
  showDetailInfo(detailInfo) {
    alert("获取到实体了");
  }
  onMapClick(movement) {
    const cartesian = this.viewer.scene.pickPosition(movement.position);
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      this.drawMethod(longitude, latitude);
    }
  }

  // 绘制-静态直接绘制
  drawMethod(longitude, latitude) {
    switch (this.drawType) {
      case "point":
        longitude && latitude ? this.addPoint(longitude, latitude) : "";
        // this.addPoint(...jinan);
        break;
      case "billboard":
        longitude && latitude
          ? this.addPointWithBillboardAndLabel(longitude, latitude)
          : "";
        // this.addPointWithBillboardAndLabel(...qingdao);
        break;
      case "line":
        break;
      case "polygon":
        break;
    }
  }
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
      // 重要！！！！！！！！！
      disableDepthTestDistance: Number.POSITIVE_INFINITY, // 深度测试失效的距离。当设置为 Number.POSITIVE_INFINITY 时，意味着深度测试永远不会失效，即无论距离相机多远，该图形都会始终进行深度测试
    };
    const mergedOptions = { ...defaultOptions, ...options };
    const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
    const pointEntity = this.viewer.entities.add({
      show: true,
      position: position,
      point: mergedOptions,
    });
    this.viewer.zoomTo(pointEntity);
    console.log(
      "🚀 ~ file: CesiumGeoOperations.js:75 ~ CesiumGeoOperations ~ addPoint ~ this.viewer.entities:",
      this.viewer.entities
    );
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
