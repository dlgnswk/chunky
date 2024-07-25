import FileButton from '../shared/Button/FileButton';

function ButtonArea() {
  // const exportSTL = () => {
  //   if (sceneRef.current) {
  //     const exporter = new STLExporter();
  //     const stlString = exporter.parse(sceneRef.current);
  //     const blob = new Blob([stlString], { type: 'text/plain' });

  //     const link = document.createElement('a');
  //     link.style.display = 'none';
  //     document.body.appendChild(link);

  //     link.href = URL.createObjectURL(blob);
  //     link.download = 'model.stl';
  //     link.click();

  //     document.body.removeChild(link);
  //   }
  // };

  return (
    <div className="button-area">
      <FileButton text="Save" />
      <FileButton text="Export" />
    </div>
  );
}

export default ButtonArea;
