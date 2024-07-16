import { useState, useCallback } from 'react';
import { HiOutlinePlus } from 'react-icons/hi2';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import useStore from '../../store/store';
import LayerCard from './LayerCard';

function LayerArea() {
  const [selectLayer, setSelectLayer] = useState({});
  const { layerList, addLayer, setLayerList } = useStore();

  const handleSelectClick = (layer) => {
    setSelectLayer(layer);
  };

  const handleAddLayerClick = () => {
    addLayer({});
  };

  const moveCard = useCallback(
    (dragIndex, hoverIndex) => {
      const dragLayer = layerList[dragIndex];
      const updatedLayers = [...layerList];
      updatedLayers.splice(dragIndex, 1);
      updatedLayers.splice(hoverIndex, 0, dragLayer);
      setLayerList(updatedLayers);
    },
    [layerList, setLayerList],
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="layer-area">
        <div className="layer-header">
          <div className="title">Layer</div>
          <button
            className="layer-add-button"
            aria-label="add layer"
            onClick={handleAddLayerClick}
          >
            <HiOutlinePlus />
          </button>
        </div>
        <div className="layer-content">
          {layerList.length === 0 ? (
            <div>레이어를 추가하세요.</div>
          ) : (
            layerList.map((layer, index) => {
              return (
                <LayerCard
                  key={layer.index} // key 값을 index에서 layer.index로 변경
                  index={index}
                  name={layer.name}
                  height={layer.height}
                  visible={layer.visible}
                  selectLayer={selectLayer}
                  handleSelectClick={() => handleSelectClick(layer)}
                  moveCard={moveCard}
                />
              );
            })
          )}
        </div>
      </div>
    </DndProvider>
  );
}

export default LayerArea;
