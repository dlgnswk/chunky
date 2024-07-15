import { HiOutlinePlus } from 'react-icons/hi2';
import LayerCard from './LayerCard';

function LayerArea() {
  const layerList = [
    { index: 0, name: 'layer00', height: 1, visible: true },
    { index: 1, name: 'layer01', height: 3, visible: true },
    { index: 2, name: 'layer02', height: 2, visible: false },
    { index: 3, name: 'layer03', height: 5, visible: true },
  ];

  return (
    <div className="layer-area">
      <div className="layer-header">
        <div className="title">Layer</div>
        <button className="layer-add-button" aria-label="add layer">
          <HiOutlinePlus />
        </button>
      </div>
      <div className="layer-content">
        {layerList.reverse().map((layer) => {
          return (
            <LayerCard
              key={layer.name}
              name={layer.name}
              height={layer.height}
              visible={layer.visible}
            />
          );
        })}
      </div>
    </div>
  );
}

export default LayerArea;
