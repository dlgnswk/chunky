import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';

import useStore from './store/store';

import Login from './components/Login/Login';
import Workspace from './components/Workspace/Workspace';
import Register from './components/Register/Register';
import Welcome from './components/Welcome/Welcome';
import AlertModal from './components/shared/Modal/AlertModal';

import './styles/global.scss';
import './styles/variables.scss';
import MobileView from './components/Mobile/MobileView';

function App() {
  const alertState = useStore((state) => state.alertState);
  const removeAlert = useStore((state) => state.removeAlert);
  const user = useStore((state) => state.user);

  const handleCloseAlert = (id) => {
    removeAlert(id);
  };

  return (
    <>
      <MobileView />
      {alertState.map((alert) => (
        <AlertModal
          key={alert.id}
          id={alert.id}
          message={alert.message}
          onClose={handleCloseAlert}
        />
      ))}
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={user ? '/workspace' : '/login'} />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/workspace" /> : <Login />}
          />
          <Route
            path="/workspace"
            element={user ? <Workspace /> : <Navigate to="/login" />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/welcome" element={<Welcome />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
