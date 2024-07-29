import { CiExport, CiImport } from 'react-icons/ci';
import useStore from '../../../store/store';

function FileButton({ text }) {
  const { setAlertState, layerList, exportToSTL } = useStore();

  const handleClick = () => {
    if (text === 'Export') {
      try {
        exportToSTL();
        setAlertState('success-export');
      } catch (error) {
        setAlertState('failed-export');
      }
    } else if (text === 'Save') {
      console.log('Save functionality not implemented yet');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick();
    }
  };

  return (
    <div
      className={
        layerList.length === 0 ? 'file-container' : 'able-file-container'
      }
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
    >
      <div className="file-icon">
        {text === 'Save' ? <CiImport /> : <CiExport />}
      </div>
      <div className="file-action">{text}</div>
    </div>
  );
}

export default FileButton;
