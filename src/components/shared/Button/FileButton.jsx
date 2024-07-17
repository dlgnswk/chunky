import { CiExport, CiImport } from 'react-icons/ci';

import useStore from '../../../store/store';

function FileButton({ text }) {
  const { layerList } = useStore();

  return (
    <div
      className={
        layerList.length === 0 ? 'file-container' : 'able-file-container'
      }
    >
      <div className="file-icon">
        {text === 'Save' ? <CiImport /> : <CiExport />}
      </div>
      <div className="file-action">{text}</div>
    </div>
  );
}

export default FileButton;
