const convert2Dto3D = (x, y, z, canvasSize) => {
  return [x - canvasSize.width / 2, canvasSize.height / 2 - y, z];
};

export default convert2Dto3D;
