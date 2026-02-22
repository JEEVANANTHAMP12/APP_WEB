import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to proper dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (['owner', 'staff'].includes(user.role)) return <Navigate to="/owner" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
