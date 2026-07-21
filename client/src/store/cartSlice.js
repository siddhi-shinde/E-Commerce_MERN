import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';

const emptyCart = {
  items: [],
  itemTotal: 0,
  itemDiscount: 0,
  subtotal: 0,
  totalDiscount: 0,
  finalCartAmount: 0,
  totalProducts: 0,
  totalQuantity: 0,
};

const initialState = {
  ...emptyCart,
  status: 'idle', // idle | loading | succeeded | failed
};

// ---- Thunks -------------------------------------------------------------

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/cart/getCart');
    return data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Could not load cart');
  }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post('/cart/addToCart', { product_id: productId, quantity });
      await dispatch(fetchCart());
      toast.success('Added to cart');
    } catch (err) {
      const message = err.response?.data?.message || 'Could not add to cart';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const increaseQuantity = createAsyncThunk(
  'cart/increaseQuantity',
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.put(`/cart/increaseQuantity/${productId}`);
      await dispatch(fetchCart());
    } catch (err) {
      const message = err.response?.data?.message || 'Could not update quantity';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const decreaseQuantity = createAsyncThunk(
  'cart/decreaseQuantity',
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.put(`/cart/decreaseQuantity/${productId}`);
      await dispatch(fetchCart());
    } catch (err) {
      const message = err.response?.data?.message || 'Could not update quantity';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.put(`/cart/updateQuantity/${productId}`, { quantity });
      await dispatch(fetchCart());
    } catch (err) {
      const message = err.response?.data?.message || 'Could not update quantity';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/cart/removeProduct/${productId}`);
      await dispatch(fetchCart());
      toast.success('Removed from cart');
    } catch (err) {
      const message = err.response?.data?.message || 'Could not remove item';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.delete('/cart/clearCart');
    return true;
  } catch (err) {
    const message = err.response?.data?.message || 'Could not clear cart';
    toast.error(message);
    return rejectWithValue(message);
  }
});

// ---- Slice ---------------------------------------------------------------

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Dispatched on logout / when a non-customer is signed in
    resetCart: () => ({ ...emptyCart, status: 'idle' }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        Object.assign(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(clearCart.fulfilled, (state) => {
        Object.assign(state, emptyCart);
        state.status = 'succeeded';
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
