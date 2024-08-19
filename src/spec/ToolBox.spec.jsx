import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToolBox from '../components/Workspace/ToolBox';

describe('ToolBox component', () => {
  it('should call selectTool with the correct id when a tool button is clicked', () => {
    const selectToolMock = vi.fn();
    const iconList = [
      { id: 'tool1', icon: () => <span>Tool 1</span> },
      { id: 'tool2', icon: () => <span>Tool 2</span> },
    ];
    const { getByLabelText } = render(
      <ToolBox
        type="2d"
        iconList={iconList}
        selectTool={selectToolMock}
        selectedTool=""
      />,
    );

    const tool1Button = getByLabelText('tool1');
    fireEvent.click(tool1Button);

    expect(selectToolMock).toHaveBeenCalledWith('tool1');
  });
});
