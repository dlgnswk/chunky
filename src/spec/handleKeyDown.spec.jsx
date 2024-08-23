import { describe, it, expect, vi } from 'vitest';
import handleKeyDown from '../utils/handleKeyDown';

describe('handleKeyDown', () => {
  it('should call selectTool with "move" when "KeyM" is pressed', () => {
    const selectTool = vi.fn();
    const event = { code: 'KeyM' };

    handleKeyDown(event, selectTool);
    expect(selectTool).toHaveBeenCalledWith('move');
  });

  it('should call selectTool with "line" when "KeyL" is pressed', () => {
    const selectTool = vi.fn();
    const event = { code: 'KeyL' };

    handleKeyDown(event, selectTool);
    expect(selectTool).toHaveBeenCalledWith('line');
  });

  it('should call selectTool with "bezier" when "KeyA" is pressed', () => {
    const selectTool = vi.fn();
    const event = { code: 'KeyA' };

    handleKeyDown(event, selectTool);
    expect(selectTool).toHaveBeenCalledWith('bezier');
  });

  it('should call selectTool with "rectangle" when "KeyR" is pressed', () => {
    const selectTool = vi.fn();
    const event = { code: 'KeyR' };

    handleKeyDown(event, selectTool);
    expect(selectTool).toHaveBeenCalledWith('rectangle');
  });

  it('should call selectTool with "triangle" when "KeyT" is pressed', () => {
    const selectTool = vi.fn();
    const event = { code: 'KeyT' };

    handleKeyDown(event, selectTool);
    expect(selectTool).toHaveBeenCalledWith('triangle');
  });

  it('should call selectTool with "circle" when "KeyC" is pressed', () => {
    const selectTool = vi.fn();
    const event = { code: 'KeyC' };

    handleKeyDown(event, selectTool);
    expect(selectTool).toHaveBeenCalledWith('circle');
  });

  it('should call selectTool with "paintBucket" when "KeyP" is pressed', () => {
    const selectTool = vi.fn();
    const event = { code: 'KeyP' };

    handleKeyDown(event, selectTool);
    expect(selectTool).toHaveBeenCalledWith('paintBucket');
  });

  it('should call selectTool with "eraser" when "KeyE" is pressed', () => {
    const selectTool = vi.fn();
    const event = { code: 'KeyE' };

    handleKeyDown(event, selectTool);
    expect(selectTool).toHaveBeenCalledWith('eraser');
  });

  it('should not call selectTool for other keys', () => {
    const selectTool = vi.fn();
    const event = { code: 'KeyZ' };

    handleKeyDown(event, selectTool);
    expect(selectTool).not.toHaveBeenCalled();
  });
});
