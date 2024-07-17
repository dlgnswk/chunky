import FileButton from '../shared/Button/FileButton';

function ButtonArea() {
  return (
    <div className="button-area">
      <FileButton text="Save" />
      <FileButton text="Export" />
    </div>
  );
}

export default ButtonArea;
