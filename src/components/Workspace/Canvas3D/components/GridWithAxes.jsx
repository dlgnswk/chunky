import Axes from './Axes';
import Grid from './Grid';

function GridWithAxes() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <Grid />
      <Axes />
    </group>
  );
}

export default GridWithAxes;
