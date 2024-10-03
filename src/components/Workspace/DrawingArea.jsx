import Canvas2D from './Canvas2D/Canvas2D';
import Canvas3D from './Canvas3D/Canvas3D';

function DrawingArea() {
  return (
    <div className="drawing-area">
      <Canvas2D />
      <Canvas3D />
    </div>
  );
}

export default DrawingArea;
