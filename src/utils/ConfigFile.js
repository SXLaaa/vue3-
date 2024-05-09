export const ROUTE_WHITELIST = ["/login", "/three/cesium/cesiumLayer"];
export const ininCoordinates = {
  longitude: 117.0, // 替换为具体的目标经纬度
  latitude: 36.0,
  targetHeight: 1000000, // 目标高度，单位米
  heading: 0.0, // 朝向角度，例如正北为0
  pitch: -90, // 俯仰角度，例如向下45度看向地面
  roll: 0.0,
  duration: 2, //飞行动画持续时间，单位秒
};

// 选取山东省内几个城市的坐标作为示例
export const jinan = [117.00606, 36.67117]; // 济南市
export const qingdao = [120.38129, 36.06711]; // 青岛市
export const zibo = [118.04653, 36.81407]; // 淄博市
export const yantai = [121.39015, 37.50263]; // 烟台市

// // 绘制点（以济南市为例）
// geoOps.addPoint(...jinan);

// // 绘制线（连接济南和青岛）
// geoOps.addLine([...jinan, ...qingdao]);

// // 绘制多边形（构建一个包含几个城市在内的虚构多边形区域）
// // 注意：这里的多边形只是示例，并不精确对应任何真实行政边界
// const polygonCoords = [...jinan, ...qingdao, ...zibo, ...yantai, ...jinan];
// geoOps.addPolygon(polygonCoords);

// // 计算线段距离（济南到青岛）
// // 这里直接使用了经纬度坐标，但在实际应用中，你需要从实体中获取Cartesian3位置再调用距离计算方法
// // console.log(geoOps.calculateDistance(...));

// // 计算多边形面积（同上，直接使用经纬度坐标示意）
// // console.log(geoOps.calculatePolygonArea(polygonCoords));
