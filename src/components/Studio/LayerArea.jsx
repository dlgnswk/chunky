import { useState } from 'react';
import { HiOutlinePlus } from 'react-icons/hi2';

import useStore from '../../store/store';

import LayerCard from './LayerCard';

function LayerArea() {
  const [selectLayer, setSelectLayer] = useState({});
  const { layerList, addLayer } = useStore();

  const handleSelectClick = (layer) => {
    setSelectLayer(layer);
  };

  const handleAddLayerClick = () => {
    addLayer({});
  };

  return (
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
          layerList.reverse().map((layer) => {
            return (
              <LayerCard
                key={layer.name}
                name={layer.name}
                index={layer.index}
                height={layer.height}
                visible={layer.visible}
                selectLayer={selectLayer}
                handleSelectClick={() => handleSelectClick(layer)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default LayerArea;
