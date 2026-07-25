// models/homepageSettingsModel.js
// Singleton document holding the homepage content that isn't a banner or a
// category. Read through `getSettings()` so callers never have to handle null.
import mongoose from 'mongoose';

const homepageSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'homepage', unique: true },

  categorySection: {
    heading: { type: String, default: 'The Collections' },
    subtext: { type: String, default: '' },
  },

  brandStory: {
    enabled: { type: Boolean, default: false },
    heading: { type: String, default: '' },
    body: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    public_id: { type: String, default: '' },
    ctaLabel: { type: String, default: '' },
    ctaLink: { type: String, default: '' },
  },
}, { timestamps: true });

const HomepageSettings =
  mongoose.models.HomepageSettings ||
  mongoose.model('HomepageSettings', homepageSettingsSchema);

// Upsert-on-read: the singleton always exists from the first request onward.
export const getSettings = async () => {
  return HomepageSettings.findOneAndUpdate(
    { key: 'homepage' },
    { $setOnInsert: { key: 'homepage' } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

export default HomepageSettings;
