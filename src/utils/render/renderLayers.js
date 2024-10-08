const renderLayers = (canvasRef, layerList, imageCache) => {
  const ctx = canvasRef.current?.getContext('2d');

  if (!ctx) return;

  layerList.forEach((layer) => {
    if (layer && layer.visible) {
      if (layer.type === 'draw') {
        layer.path.forEach((path) => {
          ctx.beginPath();

          switch (path.type) {
            case 'closedBezier':
              path.curves.forEach((curve, index) => {
                if (index === 0) {
                  ctx.moveTo(curve.x1, curve.y1);
                }
                if (curve.type === 'bezier') {
                  ctx.quadraticCurveTo(curve.cx, curve.cy, curve.x2, curve.y2);
                } else if (curve.type === 'line') {
                  ctx.lineTo(curve.x2, curve.y2);
                }
              });
              ctx.closePath();
              break;
            case 'bezier':
              ctx.moveTo(path.x1, path.y1);
              ctx.quadraticCurveTo(path.cx, path.cy, path.x2, path.y2);
              break;
            case 'rectangle':
              ctx.rect(path.x, path.y, path.width, path.height);
              break;
            case 'triangle':
              ctx.moveTo(path.points[0].x, path.points[0].y);
              ctx.lineTo(path.points[1].x, path.points[1].y);
              ctx.lineTo(path.points[2].x, path.points[2].y);
              ctx.closePath();
              break;
            case 'line':
              ctx.moveTo(path.x1, path.y1);
              ctx.lineTo(path.x2, path.y2);
              break;
            case 'circle':
              ctx.arc(
                path.center.x,
                path.center.y,
                path.radius,
                0,
                2 * Math.PI,
              );
              break;
            case 'polyline':
              ctx.moveTo(path.points[0].x, path.points[0].y);
              for (let i = 1; i < path.points.length; i += 1) {
                ctx.lineTo(path.points[i].x, path.points[i].y);
              }
              if (path.closed) {
                ctx.closePath();
              }
              break;
            default:
              break;
          }

          if (path.fill && path.fill !== 'none') {
            ctx.fillStyle = path.fill;
            ctx.fill();
          }

          ctx.strokeStyle = '#0068ff';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      } else if (layer.type === 'image' && layer.imageUrl) {
        if (!imageCache.has(layer.imageUrl)) {
          const img = new Image();

          img.onload = () => {
            imageCache.set(layer.imageUrl, img);
            ctx.save();
            ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;
            ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
            ctx.restore();
          };

          img.src = layer.imageUrl;
        } else {
          const cachedImg = imageCache.get(layer.imageUrl);

          ctx.save();
          ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;
          ctx.drawImage(cachedImg, layer.x, layer.y, layer.width, layer.height);
          ctx.restore();
        }
      }
    }
  });
};

export default renderLayers;
