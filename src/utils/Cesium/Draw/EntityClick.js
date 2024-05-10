/**
 * 实体点击方法：待扩展
 * */
class EntityClick {
  constructor(viewer) {
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
  }
  // 新增方法：为指定实体添加点击事件
  addClickListenerToEntity(entity, detailInfo) {
    if (!this.handler) {
      console.error("ScreenSpaceEventHandler not initialized.");
      return;
    }
    this.handler.setInputAction((movement) => {
      // 使用 drillPick 获取所有可能的实体
      const pickedEntities = entity
        ? entity
        : this.viewer.scene.pick(movement.position);
      //判断是否有这个实体
      if (Cesium.defined(pickedEntities) && pickedEntities.id) {
        this.showDetailInfo(detailInfo);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  showDetailInfo(detailInfo) {
    alert(detailInfo);
  }
}
export default EntityClick;
