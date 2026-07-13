import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  public_id: { type: String },
  heading: { type: String, default: '' },
  subtext: { type: String, default: '' },
  ctaLabel: { type: String, default: '' },
  ctaLink: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
export default Banner;
