import { useEffect } from 'react';
import { HiOutlinePlus } from 'react-icons/hi2';
import { HiOutlinePencilAlt } from 'react-icons/hi';

import { v4 as uuidv4 } from 'uuid';

import useStore from '../../store/store';

import LayerCard from './LayerCard';
import LayerImage from './LayerImage';

function LayerArea() {
  const {
    layerList = [],
    addLayer,
    selectedLayer,
    setSelectedLayer,
    layerTitle,
    setLayerTitle,
  } = useStore();

  useEffect(() => {
    if (layerList.length > 0 && !selectedLayer) {
      setSelectedLayer(layerList[layerList.length - 1]);
    }
  }, [layerList, selectedLayer, setSelectedLayer]);

  const handleSelectClick = (layer) => {
    setSelectedLayer(layer);
  };

  const handleAddLayerClick = () => {
    addLayer();
  };

  const safeLayers = Array.isArray(layerList) ? layerList : [];

  return (
    <div className="layer-area">
      <div className="layer-header">
        <div className="layer-icon-title">
          <HiOutlinePencilAlt />
          <input
            type="text"
            value={layerTitle}
            onChange={(e) => setLayerTitle(e.target.value)}
            className="layer-title-input"
          />
        </div>
        <button
          className="layer-add-button"
          aria-label="add layer"
          onClick={handleAddLayerClick}
        >
          <HiOutlinePlus />
        </button>
      </div>
      <div className="layer-content">
        {safeLayers.length === 0 ? (
          <div>레이어를 추가하세요.</div>
        ) : (
          safeLayers
            .slice()
            .sort((a, b) => b.index - a.index)
            .map((layer) => {
              if (layer.type === 'draw') {
                return (
                  <LayerCard
                    key={uuidv4()}
                    layer={layer}
                    id={uuidv4()}
                    index={layer.index}
                    name={layer.name}
                    zIndex={layer.zIndex}
                    height={layer.height}
                    visible={layer.visible}
                    fill={layer.fill}
                    selectLayer={selectedLayer}
                    handleSelectClick={() => handleSelectClick(layer)}
                  />
                );
              }
              return (
                <LayerImage
                  key={uuidv4()}
                  layer={layer}
                  index={layer.index}
                  name={layer.name}
                  visible={layer.visible}
                ></LayerImage>
              );
            })
        )}
      </div>
    </div>
  );
}

export default LayerArea;
