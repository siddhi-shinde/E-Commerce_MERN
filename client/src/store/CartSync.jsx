import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { fetchCart, resetCart } from './cartSlice';

// Bridges the Context-based auth state with the Redux cart store: whenever
// the logged-in user changes, refresh (or reset) the cart accordingly.
// Renders nothing - just keeps the two in sync.
const CartSync = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated && user?.role === 'customer') {
      dispatch(fetchCart());
    } else {
      dispatch(resetCart());
    }
  }, [isAuthenticated, user?.role, loading, dispatch]);

  return null;
};

export default CartSync;
