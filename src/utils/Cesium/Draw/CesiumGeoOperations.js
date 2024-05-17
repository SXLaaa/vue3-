/**
 * 基础绘制
 * 点
 * 图标
 * */
import { jinan, qingdao } from "@/utils/ConfigFile.js"; // 引入全局白名单
import billboardImage from "@/assets/images/广告牌识别.png";
class CesiumGeoOperations {
  constructor(viewer) {
    this.viewer = viewer;
    this.drawType = null;
    // 添加点击事件监听
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
  }
  // 设置绘制类型
  setDrawType(drawType1) {
    this.drawType = drawType1;
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.viewer.scene.globe.depthTestAgainstTerrain = true; // 场景中的几何体（如点、线、面等）能够正确显示在地形之上或之下
    this.setupClickHandler();
  }
  // 设置底图监听回调事件
  setupClickHandler() {
    let viewer = this.viewer;
    let { handler, drawType } = this;
    // 左键点击事件
    handler.setInputAction((movement) => {
      // 使用 drillPick 获取所有可能的实体+判断是否有这个实体
      const pickedEntities = viewer.scene.pick(movement.position);
      if (
        Cesium.defined(pickedEntities) &&
        pickedEntities.id &&
        drawType !== "line"
      ) {
        this.showDetailInfo();
      }
      drawType !== "line" ? this.onMapClick(movement) : "";
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
      this.drawMethod(cartesian, longitude, latitude);
    }
  }

  // 绘制-静态直接绘制
  drawMethod(cartesian, longitude, latitude) {
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
      disableDepthTestDistance: Number.POSITIVE_INFINITY, // 深度测试失效的距离。当设置为 Number.POSITIVE_INFINITY 时，意味着深度测试永远不会失效，即无论距离相机多远，该图形都会始终进行深度测试
    };
    const mergedOptions = { ...defaultOptions, ...options };
    const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
    const pointEntity = this.viewer.entities.add({
      show: true,
      position: position,
      point: mergedOptions,
    });
    return pointEntity;
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
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
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
  }
}
export default CesiumGeoOperations;
