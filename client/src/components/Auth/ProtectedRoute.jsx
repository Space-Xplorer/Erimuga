
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('userAuthToken');
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdmin = user?.userType === 'admin';

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
