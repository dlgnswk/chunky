import Canvas2D from './Canvas2D/components/Canvas2D';
import Canvas3D from './Canvas3D/components/Canvas3D';

function DrawingArea() {
  return (
    <div className="drawing-area">
      <Canvas2D />
      <Canvas3D />
    </div>
  );
}

export default DrawingArea;
