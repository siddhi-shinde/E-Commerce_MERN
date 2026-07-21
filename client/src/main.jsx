import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/theme.css';

import App from './App';
import { AuthProvider } from './context/AuthContext';
import { store } from './store/store';
import CartSync from './store/CartSync';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <CartSync />
          <App />
          <ToastContainer position="top-right" autoClose={2500} />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
