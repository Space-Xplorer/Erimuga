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

  if (!product) return <div className="bg-paper py-32 text-center text-sm text-ink-muted">Loading…</div>;

  return (
    <div className="bg-paper">
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 md:grid-cols-2">
        {/* Product Images Section */}
        <div className="flex flex-col gap-4">
          <div className="flex w-full items-center justify-center overflow-hidden bg-paper-dim">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="max-h-140 w-full object-cover"
              />
            ) : (
              <div className="py-32 text-center text-sm text-ink-muted">No image available</div>
            )}
          </div>

          {/* Thumbnails (for the currently selected colour) */}
          {currentGallery.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {currentGallery.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`h-20 w-16 cursor-pointer object-cover transition ${
                    mainImage === img ? 'ring-2 ring-brand' : 'opacity-80 hover:opacity-100'
                  }`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">{product.name}</h1>
          <p className="mt-4 font-display text-3xl text-brand">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </p>

          <p className="mt-6 whitespace-pre-line text-[0.95rem] leading-[1.9] text-ink-soft">
            {product.description}
          </p>

          {/* Color Selector */}
          {product.availableColors?.length > 0 && (
            <div className="mt-8">
              <label className="eyebrow">Colour</label>
              <div className="mt-3 flex flex-wrap items-start gap-4">
                {product.availableColors.map((color) => {
                  const available = isColorAvailable(color);
                  const swatchHex = product.colors?.find(c => c.name === color)?.swatchHex;
                  const hasValidHex = swatchHex && /^#[0-9a-fA-F]{6}$/.test(swatchHex);
                  return (
                    <div key={color} className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => available && handleSelectColor(color)}
                        disabled={!available}
                        className={`h-10 w-10 rounded-full border-2 transition duration-200
                          ${selectedColor === color ? 'border-brand ring-2 ring-brand/30 ring-offset-2 ring-offset-paper' : 'border-paper-deep'}
                          ${!available ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                          ${!hasValidHex ? 'bg-paper-deep' : ''}`}
                        style={hasValidHex ? { backgroundColor: swatchHex } : {}}
                        title={available ? color : `${color} — out of stock`}
                      />
                      <span className="text-xs text-ink-muted">{color}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.availableSizes?.length > 0 && (
            <div className="mt-7">
              <label className="eyebrow">Select size</label>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {product.availableSizes.map((size) => {
                  const available = isSizeAvailable(size);
                  return (
                    <button
                      key={size}
                      onClick={() => available && setSelectedSize(size)}
                      disabled={!available}
                      className={`rounded-full border px-4 py-2 text-sm transition
                        ${selectedSize === size
                          ? 'border-ink bg-ink text-paper'
                          : available
                          ? 'border-paper-deep text-ink-soft hover:border-ink-muted'
                          : 'cursor-not-allowed border-paper-deep text-ink-muted line-through'}`}
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
            <p className="mt-5 text-sm font-medium text-brand">
              Only {selectedStock} left — order soon.
            </p>
          )}

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || selectedStock === 0}
            className={`mt-8 w-full py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition sm:w-auto sm:px-12
              ${selectedStock === 0
                ? 'cursor-not-allowed bg-ink-muted'
                : isAdding
                ? 'cursor-not-allowed bg-green-600'
                : 'bg-brand hover:opacity-90'}`}
          >
            {selectedStock === 0 ? 'Out of stock' : addedMessage ? 'Added to cart' : 'Add to cart'}
          </button>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-20 border-t border-paper-deep pt-12">
        <h2 className="mb-4 font-display text-3xl text-ink">Customer Reviews</h2>

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
          <form onSubmit={handleSubmitReview} className="mb-8 max-w-xl space-y-3 border border-paper-deep bg-paper-dim p-6">
            <h3 className="font-display text-xl text-ink">Write a review</h3>
            <div>
              <label className="mb-1 block text-sm text-ink-soft">Your Rating *</label>
              <StarRating value={reviewRating} onChange={setReviewRating} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink-soft">Comment (optional)</label>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Tell others what you think about this product…"
                className="w-full rounded-lg border border-paper-deep bg-paper p-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-brand px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {submittingReview ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-ink-muted">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="max-w-2xl space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="border border-paper-deep bg-white p-5">
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
    </div>
  );
};

export default ProductinDetail;
