function ToolBox({ type, iconList, selectTool, selectedTool }) {
  return (
    <div className="toolbox-container">
      {type === '2d' &&
        iconList.map(({ id, icon: IconComponent }) => (
          <button
            className={`tool-button ${selectedTool === id ? 'selected' : ''}`}
            key={id}
            aria-label={id}
            onClick={() => selectTool(id)}
          >
            <IconComponent />
          </button>
        ))}
      {type === '3d' &&
        iconList.map(({ id, icon: IconComponent }) => (
          <button
            className={`tool-button ${selectedTool === id ? 'selected' : ''}`}
            key={id}
            aria-label={id}
            onClick={() => selectTool(id)}
          >
            <IconComponent />
          </button>
        ))}
    </div>
  );
}

export default ToolBox;
