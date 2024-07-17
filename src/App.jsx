import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';

import useStore from './store/store';

import Login from './components/Login/Login';
import Studio from './components/Studio/Studio';
import Register from './components/Register/Register';
import Welcome from './components/Welcome/Welcome';
import AlertModal from './components/shared/Modal/AlertModal';

import './styles/global.scss';
import './styles/variables.scss';

function App() {
  const alertState = useStore((state) => state.alertState);
  const removeAlert = useStore((state) => state.removeAlert);
  const user = useStore((state) => state.user);

  const handleCloseAlert = (id) => {
    removeAlert(id);
  };

  return (
    <>
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
            element={<Navigate to={user ? '/studio' : '/login'} />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/studio" /> : <Login />}
          />
          <Route
            path="/studio"
            element={user ? <Studio /> : <Navigate to="/login" />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/welcome" element={<Welcome />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
