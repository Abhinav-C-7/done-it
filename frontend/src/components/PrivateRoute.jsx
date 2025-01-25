import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, userType }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (userType && user.user_type !== userType) {
        return <Navigate to="/" />;
    }

    return children;
}

export default PrivateRoute;
