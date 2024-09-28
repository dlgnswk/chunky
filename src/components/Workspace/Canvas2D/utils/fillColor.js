const handleStart = async (event, state) => {
  const {
    canvasRef,
    scale,
    layerList,
    checkMousePoint,
    updateLayerInFirestore,
  } = state;

  const rect = canvasRef.current.getBoundingClientRect();
  const x = (event.clientX - rect.left) / scale;
  const y = (event.clientY - rect.top) / scale;

  const clickedLayer = layerList.find((layer) =>
    layer.path.some((path) => checkMousePoint(path, x, y)),
  );

  if (clickedLayer) {
    const clickedPathIndex = clickedLayer.path.findIndex((path) =>
      checkMousePoint(path, x, y),
    );

    if (clickedPathIndex !== -1) {
      const updatedLayer = {
        ...clickedLayer,
        path: clickedLayer.path.map((path, index) =>
          index === clickedPathIndex
            ? { ...path, fill: clickedLayer.fill }
            : path,
        ),
      };

      updateLayerInFirestore(updatedLayer);
    }
  }
};

export default {
  handleStart,
};
