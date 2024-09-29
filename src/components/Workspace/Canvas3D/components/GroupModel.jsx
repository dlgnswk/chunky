import RectangleModel from './RectangleModel';
import CircleModel from './CircleModel';
import TriangleModel from './TriangleModel';
import PolygonModel from './PolygonModel';
import BezierModel from './BezierModel';

function GroupModel({
  path,
  depth,
  canvasSize,
  flipHorizontally,
  fill,
  zPosition,
}) {
  let ModelComponent;

  switch (path.type) {
    case 'rectangle':
      ModelComponent = RectangleModel;
      break;
    case 'circle':
      ModelComponent = CircleModel;
      break;
    case 'triangle':
      ModelComponent = TriangleModel;
      break;
    case 'polyline':
      ModelComponent = PolygonModel;
      break;
    case 'bezier':
    case 'closedBezier':
      ModelComponent = BezierModel;
      break;
    default:
      return null;
  }

  return (
    <ModelComponent
      path={path}
      depth={depth}
      canvasSize={canvasSize}
      flipHorizontally={flipHorizontally}
      fill={fill}
      zPosition={zPosition}
    />
  );
}

export default GroupModel;
