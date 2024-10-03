import useStore from '../../../store/store';

function Grid() {
  const canvasSize = useStore((state) => state.canvasSize);
  const { width, depth } = canvasSize;
  const size = Math.max(width, depth);
  const divisions = width / 10;

  return (
    <gridHelper
      args={[size, divisions, 0x555555, 0x555555]}
      position={[0, 0, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <lineBasicMaterial
        attach="material"
        transparent
        opacity={1}
        color="#898f99"
      />
    </gridHelper>
  );
}

export default Grid;
