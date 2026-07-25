import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import { useAuth } from './components/Auth/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ConsentBanner from './components/ConsentBanner';

// Eagerly load storefront pages (customer critical path)
import Home from './pages/Home';
import Collection from './pages/Collection';
import CategoryPage from './pages/CategoryPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import ProductinDetail from './pages/ProductinDetail';
import UserDashboard from './pages/UserDashboard';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Lazy load admin pages — only downloaded when an admin visits
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));
const EditProduct = lazy(() => import('./pages/admin/EditProduct'));
const ProductList = lazy(() => import('./pages/admin/Products'));
const Coupons = lazy(() => import('./pages/admin/Coupons'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const ContactMessages = lazy(() => import('./pages/admin/ContactMessages'));
const HomepageStudio = lazy(() => import('./pages/admin/HomepageStudio'));
const CategoryManager = lazy(() => import('./pages/admin/CategoryManager'));

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand" />
  </div>
);

const App = () => {
  const { loading } = useAuth();

  if (loading) return <Spinner />;

  return (
    <div className='flex flex-col min-h-screen'>
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/dashboard' element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path='/collection' element={<Collection />} />
          <Route path='/collection/:categorySlug' element={<CategoryPage />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/privacy' element={<Privacy />} />
          <Route path='/terms' element={<Terms />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/product/:id' element={<ProductinDetail />} />
          <Route path='/orders' element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          {/* Admin — lazy loaded */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
          <Route path="/admin/edit-product/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
          <Route path="/admin/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute><ContactMessages /></ProtectedRoute>} />
          <Route path="/admin/homepage" element={<ProtectedRoute><HomepageStudio /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute><CategoryManager /></ProtectedRoute>} />
          {/* Old bookmark — the Banners page is now the Carousel tab of the studio */}
          <Route path="/admin/banners" element={<Navigate to="/admin/homepage" replace />} />
        </Routes>
      </Suspense>
      <Footer />
      <ConsentBanner />
    </div>
  )
}

export default App
