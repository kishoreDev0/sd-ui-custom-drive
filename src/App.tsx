import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Login from './components/login';
import RegistrationForm from './components/register-form';
import ForgotPassword from './components/forgot-password';
import './App.css';
import ChangePassword from './components/change-password';
import Dashboard from './pages/dashboard';
import { AuthProvider } from './components/login/authState';
import PrivateRoute from './axios-setup/private-route';
import GoogleAuthSuccess from './components/login/googleSignIn';
import GitHubAuthSuccess from './components/login/githubSignIn';
import Loader from './components/loader/loader';

const App = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registerform" element={<RegistrationForm />} />
            <Route path="/loader" element={<Loader />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/change" element={<ChangePassword />} />
            <Route
              path="/dashboard"
              element={<PrivateRoute element={<Dashboard />} />}
            />
            <Route
              path="/google-auth-success"
              element={<GoogleAuthSuccess />}
            />
            <Route
              path="/github-auth-success"
              element={<GitHubAuthSuccess />}
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </Provider>
  );
};

export default App;
