import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "../config/axios";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import { useAuth } from "../components/Auth/AuthContext";
import { ShopContext } from "../context/ShopContext";

const StarRating = ({ value, onChange, readonly = false }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type={onChange ? 'button' : undefined}
        onClick={() => onChange && onChange(n)}
        disabled={readonly}
        className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
      >
        <Star
          className={`w-5 h-5 ${n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      </button>
    ))}
  </div>
);

const ProductinDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useContext(ShopContext);

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [isAdding, setIsAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);
  const [mainImage, setMainImage] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/products/${id}`);
        setProduct(res.data);

        // Default to the first colour's photos if available, else the flat image list
        const firstColor = res.data.colors?.[0]?.name || res.data.availableColors?.[0] || '';
        setSelectedColor(firstColor);
        const firstColorImages = res.data.colors?.find(c => c.name === firstColor)?.images?.map(i => i.url);
        const imgs = firstColorImages?.length > 0 ? firstColorImages : (res.data.image || []);
        setMainImage(imgs[0] || '');
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    fetchProduct();

    axios.get(`/reviews/product/${id}`)
      .then(res => setReviews(res.data))
      .catch(() => {});
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please log in to leave a review'); return; }
    if (reviewRating === 0) { toast.error('Please select a star rating'); return; }
    setSubmittingReview(true);
    const tid = toast.loading('Submitting review…');
    try {
      const res = await axios.post('/reviews', { productId: id, rating: reviewRating, comment: reviewComment });
      setReviews(prev => [res.data.review, ...prev]);
      setReviewRating(0);
      setReviewComment('');
      toast.dismiss(tid);
      toast.success('Review submitted!');
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  const getVariantStock = (size, color) => {
    if (!product?.variants?.length) return null;
    const v = product.variants.find(v => v.size === size && v.color === color);
    return v ? v.stock : null;
  };

  const isSizeAvailable = (size) => {
    if (!product?.variants?.length) return true;
    if (!selectedColor) return true;
    const stock = getVariantStock(size, selectedColor);
    return stock === null || stock > 0;
  };

  const isColorAvailable = (color) => {
    if (!product?.variants?.length) return true;
    if (!selectedSize) return true;
    const stock = getVariantStock(selectedSize, color);
    return stock === null || stock > 0;
  };

  const selectedStock = selectedSize && selectedColor ? getVariantStock(selectedSize, selectedColor) : null;

  const getColorImages = (colorName) => {
    const entry = product?.colors?.find(c => c.name === colorName);
    const imgs = entry?.images?.map(i => i.url);
    return imgs?.length > 0 ? imgs : (product?.image || []);
  };

  const handleSelectColor = (color) => {
    setSelectedColor(color);
    const imgs = getColorImages(color);
    setMainImage(imgs[0] || '');
  };

  const currentGallery = getColorImages(selectedColor);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select both size and colour");
      return;
    }
    if (selectedStock !== null && selectedStock === 0) {
      toast.error("This combination is out of stock");
      return;
    }

    setIsAdding(true);
    setAddedMessage(true);

    addToCart(product, quantity, selectedSize, selectedColor);

    setTimeout(() => {
      setIsAdding(false);
      setAddedMessage(false);
    }, 2000);
  };

  if (!product) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Product Images Section */}
        <div className="flex flex-col items-center">
          <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center w-full">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="w-full max-h-[500px] object-contain rounded-lg"
              />
            ) : (
              <div className="text-center text-gray-400 text-sm">No image available</div>
            )}
          </div>

          {/* Thumbnails (for the currently selected colour) */}
          {currentGallery.length > 1 && (
            <div className="flex gap-3 mt-4 flex-wrap justify-center">
              {currentGallery.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`w-20 h-20 object-cover rounded-lg border cursor-pointer transition
                    ${mainImage === img ? "border-[#B22222] border-2" : "border-gray-300"}`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>

          {/* Product Description */}
          <div className="mt-2">
            <h2 className="text-lg font-semibold text-gray-700">Description:</h2>
            <p className="text-gray-600 mt-1 whitespace-pre-line">{product.description}</p>
          </div>

          <p className="text-2xl font-semibold text-[#B22222]">₹{product.price}</p>

          {/* Color Selector */}
          {product.availableColors?.length > 0 && (
            <div className="mt-2">
              <label className="block mb-1 font-medium text-gray-700">COLOUR</label>
              <div className="flex items-start gap-4 mt-2 flex-wrap">
                {product.availableColors.map((color) => {
                  const available = isColorAvailable(color);
                  const swatchHex = product.colors?.find(c => c.name === color)?.swatchHex;
                  const hasValidHex = swatchHex && /^#[0-9a-fA-F]{6}$/.test(swatchHex);
                  return (
                    <div key={color} className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => available && handleSelectColor(color)}
                        disabled={!available}
                        className={`w-10 h-10 rounded-full shadow border-2 transition duration-200
                          ${selectedColor === color ? 'border-[#B22222]' : 'border-transparent'}
                          ${!available ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                          ${!hasValidHex ? 'bg-gray-200' : ''}`}
                        style={hasValidHex ? { backgroundColor: swatchHex } : {}}
                        title={available ? color : `${color} — out of stock`}
                      />
                      <span className="text-xs text-gray-500">{color}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.availableSizes?.length > 0 && (
            <div className="mt-4">
              <label className="block mb-1 font-medium text-gray-700">SELECT SIZE</label>
              <div className="flex flex-wrap gap-3 mt-2">
                {product.availableSizes.map((size) => {
                  const available = isSizeAvailable(size);
                  return (
                    <button
                      key={size}
                      onClick={() => available && setSelectedSize(size)}
                      disabled={!available}
                      className={`px-4 py-2 border rounded-full transition
                        ${selectedSize === size
                          ? 'bg-[#B22222] text-white border-[#B22222]'
                          : available
                          ? 'bg-white text-gray-800 border-gray-300 hover:border-[#B22222]'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Low stock badge */}
          {selectedStock !== null && selectedStock > 0 && selectedStock <= 5 && (
            <p className="text-sm font-medium text-orange-600">
              Only {selectedStock} left — order soon!
            </p>
          )}

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || selectedStock === 0}
            className={`
              mt-6 flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-white font-medium transition-all duration-200
              ${selectedStock === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : isAdding
                ? 'bg-green-600 cursor-not-allowed'
                : 'bg-[#B22222] hover:bg-red-700 scale-105'}
            `}
          >
            🛒 {selectedStock === 0 ? "Out of Stock" : addedMessage ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-16 border-t pt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Customer Reviews</h2>

        {reviews.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <StarRating value={Math.round(product.avgRating || 0)} readonly />
            <span className="text-gray-600 text-sm">
              {(product.avgRating || 0).toFixed(1)} out of 5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        {/* Write a review */}
        {isAuthenticated && (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-2xl p-5 mb-8 space-y-3 max-w-xl">
            <h3 className="font-semibold text-gray-700">Write a Review</h3>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Your Rating *</label>
              <StarRating value={reviewRating} onChange={setReviewRating} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Comment (optional)</label>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Tell others what you think about this product…"
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#B22222] focus:border-[#B22222]"
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-[#B22222] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {submittingReview ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-4 max-w-2xl">
            {reviews.map(review => (
              <div key={review._id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 text-sm">{review.userName}</span>
                    {review.verifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Verified Purchase</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <StarRating value={review.rating} readonly />
                {review.comment && <p className="text-gray-600 text-sm mt-2 leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductinDetail;
