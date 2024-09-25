import renderToolBezier from './renderToolBezier';
import renderToolCircle from './renderToolCircle';
import renderToolLine from './renderToolLine';
import renderToolRectangle from './renderToolRectangle';
import renderToolSnapPoint from './renderToolSnapPoint';
import renderToolTriangle from './renderToolTriangle';

function renderCurrentTool(ctx, selectedTool, props) {
  switch (selectedTool) {
    case 'line':
      renderToolLine(ctx, { ...props });
      break;
    case 'bezier':
      renderToolBezier(ctx, { ...props });
      break;
    case 'rectangle':
      renderToolRectangle(ctx, { ...props });
      break;
    case 'triangle':
      renderToolTriangle(ctx, { ...props });
      break;
    case 'circle':
      renderToolCircle(ctx, { ...props });
      break;
    default:
      break;
  }

  if (props.snapPoint) {
    renderToolSnapPoint(ctx, props.snapPoint);
  }
}

export default renderCurrentTool;
