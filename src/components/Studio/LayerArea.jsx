import { useEffect } from 'react';
import { HiOutlinePlus } from 'react-icons/hi2';
import useStore from '../../store/store';
import LayerCard from './LayerCard';

function LayerArea() {
  const {
    layerList = [],
    addLayer,
    selectedLayer,
    setSelectedLayer,
    loadLayers,
  } = useStore();

  useEffect(() => {
    loadLayers();
  }, [loadLayers]);

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
        {safeLayers.length === 0 ? (
          <div>레이어를 추가하세요.</div>
        ) : (
          safeLayers
            .slice()
            .reverse()
            .map((layer) => (
              <LayerCard
                key={layer.id}
                id={layer.id}
                name={layer.name}
                index={layer.index}
                height={layer.height}
                visible={layer.visible}
                selectLayer={selectedLayer}
                handleSelectClick={() => handleSelectClick(layer)}
              />
            ))
        )}
      </div>
    </div>
  );
}

export default LayerArea;
