import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RequireRole({ role, children }) {
  const auth = useAuth();
  const location = useLocation();
  if (!auth.user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (auth.user.role !== role) {
    return (
      <Navigate
        to={auth.user.role === 'admin' ? '/admin' : '/employee'}
        replace
        state={{ message: `บัญชีนี้ไม่มีสิทธิ์เข้า ${location.pathname}` }}
      />
    );
  }
  return children;
}
