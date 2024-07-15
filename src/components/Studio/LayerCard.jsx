import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCopy,
  AiOutlineDelete,
} from 'react-icons/ai';

function LayerCard({ name, height, visible }) {
  return (
    <div className="layer-card">
      <div className="layer-info">
        <div className="layer-visible">
          {visible ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
        </div>
        <div className="layer-wrapper">
          <div>
            <input className="layer-name-input" defaultValue={name} />
          </div>
          <div>
            <input className="layer-height-input" defaultValue={height} />
            mm
          </div>
        </div>
      </div>
      <div className="layer-icon">
        <div className="layer-icon-copy">
          <AiOutlineCopy />
        </div>
        <div className="layer-icon-delete">
          <AiOutlineDelete />
        </div>
      </div>
    </div>
  );
}

export default LayerCard;
