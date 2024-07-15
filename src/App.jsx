import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';

import Login from './components/Login/Login';
import Studio from './components/Studio/Studio';
import Register from './components/Register/Register';
import Welcome from './components/Welcome/Welcome';

import './styles/global.scss';
import './styles/variables.scss';

function App() {
  const isLoggedIn = true;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? '/studio' : '/login'} />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/register" element={<Register />} />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </Router>
  );
}

export default App;
