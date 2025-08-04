import { Navigate, useLocation } from 'react-router-dom';


const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('userAuthToken');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdminRoute && (!user || !user.isAdmin)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
