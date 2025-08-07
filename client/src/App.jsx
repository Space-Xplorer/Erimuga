import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
import Contact from './pages/Contact';
import Product from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import Checkout from './pages/Checkout';
import ProductinDetail from './pages/ProductinDetail';
import AdminDashboard from './pages/AdminDashboard';
import AddProduct from './pages/admin/AddProduct';
import OrderDetails from './pages/admin/OrderDetails';
// import Stats from './pages/admin/Stats';


const App = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar />
      <Routes>

          <Route path='/' element={<Home />} />
          <Route path='/collection' element={<Collection />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/product' element={<Product />} />
          <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/product/:id' element={<ProductinDetail />} />
          <Route path='/place-order' element={<ProtectedRoute><PlaceOrder /></ProtectedRoute>} />
          <Route path='/orders' element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
          <Route path="/admin/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          {/* <Route path="/admin/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} /> */}
      </Routes>
      <Footer />
      
    </div>
  )
}

export default App
