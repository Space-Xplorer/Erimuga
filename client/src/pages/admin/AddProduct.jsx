import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/Admin/ProductForm';

export default function AddProduct() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <ProductForm
        submitLabel="Add Product"
        onSuccess={() => navigate('/admin/products')}
      />
    </div>
  );
}
