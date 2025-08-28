import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import { useAuth } from './components/Auth/AuthContext';
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Orders from './pages/Orders';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import Checkout from './pages/Checkout';
import ProductinDetail from './pages/ProductinDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddProduct from './pages/admin/AddProduct';
import UserDashboard from './pages/UserDashboard';
import ProductList from './pages/admin/Products';


const App = () => {
  const { loading } = useAuth();

  // ✅ Show loading spinner while checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#b22222]"></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar />
      <Routes>

          <Route path='/' element={<Home />} />
          <Route path='/dashboard' element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path='/collection' element={<Collection />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/product/:id' element={<ProductinDetail />} />
          <Route path='/orders' element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
      </Routes>
      <Footer />
      
    </div>
  )
}

export default App
