import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import ShopContextProvider from './context/ShopContext';
import { AuthProvider } from './components/Auth/Auth/AuthContext';

createRoot(document.getElementById('root')).render(
  
  <BrowserRouter>
    <AuthProvider>
       <ShopContextProvider>
      <App />
    </ShopContextProvider>
    </AuthProvider>
  </BrowserRouter>,
)

