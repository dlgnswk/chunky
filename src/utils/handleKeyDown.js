const handleKeyDown = (event, selectTool) => {
  switch (event.code) {
    case 'KeyM':
      selectTool('move');
      break;
    case 'KeyL':
      selectTool('line');
      break;
    case 'KeyA':
      selectTool('bezier');
      break;
    case 'KeyR':
      selectTool('rectangle');
      break;
    case 'KeyT':
      selectTool('triangle');
      break;
    case 'KeyC':
      selectTool('circle');
      break;
    case 'KeyE':
      selectTool('eraser');
      break;
    case 'KeyI':
      selectTool('image');
      break;
    default:
      break;
  }
};

export default handleKeyDown;
