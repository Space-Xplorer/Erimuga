import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import ProductForm from '../../components/Admin/ProductForm';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => navigate('/admin/products'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b22222]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <ProductForm
        initialData={product}
        submitLabel="Save Changes"
        onSuccess={() => navigate('/admin/products')}
      />
    </div>
  );
}
