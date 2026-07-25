import Banner from '../models/bannerModel.js';
import MainCategory from '../models/mainCategoryModel.js';
import Product from '../models/productModel.js';
import HomepageSettings, { getSettings } from '../models/homepageSettingsModel.js';
import cloudinary, { uploadToCloudinary } from '../config/cloudinary.js';
import fs from 'fs';

// How many products a category band shows before "View all".
const RAIL_SIZE = 8;

// Cards only need enough to render an image, a name and a price.
const CARD_FIELDS = 'name price colors productCode mainCategory subcategory';

/**
 * One request for the whole homepage. Replaces the old pattern where the
 * Latest and BestSellers sections each downloaded the entire catalogue and
 * filtered it in the browser.
 */
export const getHomepage = async (req, res) => {
  try {
    const [banners, categories, settings] = await Promise.all([
      Banner.find({ isActive: true }).sort({ order: 1, createdAt: 1 }),
      MainCategory.find({ isActive: true, showOnHomepage: true })
        .sort({ order: 1, name: 1 })
        .populate({ path: 'featuredProducts', select: CARD_FIELDS }),
      getSettings(),
    ]);

    const bands = await Promise.all(
      categories.map(async (cat) => {
        // Hand-picked wins; an empty pick falls back to newest in the category
        // so a band is never empty just because nobody curated it yet.
        let products = (cat.featuredProducts || []).filter(Boolean).slice(0, RAIL_SIZE);

        if (products.length === 0) {
          products = await Product.find({ mainCategoryId: cat._id })
            .select(CARD_FIELDS)
            .sort({ createdAt: -1 })
            .limit(RAIL_SIZE);
        }

        return {
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          tagline: cat.tagline,
          homepageImage: cat.homepageImage,
          products,
        };
      })
    );

    res.status(200).json({
      banners,
      categorySection: settings.categorySection,
      categories: bands,
      brandStory: settings.brandStory,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load homepage', details: err.message });
  }
};

export const getHomepageSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load homepage settings', details: err.message });
  }
};

export const updateHomepageSettings = async (req, res) => {
  try {
    const settings = await getSettings();

    const {
      categoryHeading,
      categorySubtext,
      brandStoryEnabled,
      brandStoryHeading,
      brandStoryBody,
      brandStoryCtaLabel,
      brandStoryCtaLink,
    } = req.body;

    if (categoryHeading !== undefined) settings.categorySection.heading = categoryHeading;
    if (categorySubtext !== undefined) settings.categorySection.subtext = categorySubtext;

    if (brandStoryEnabled !== undefined) {
      settings.brandStory.enabled = brandStoryEnabled === 'true' || brandStoryEnabled === true;
    }
    if (brandStoryHeading !== undefined) settings.brandStory.heading = brandStoryHeading;
    if (brandStoryBody !== undefined) settings.brandStory.body = brandStoryBody;
    if (brandStoryCtaLabel !== undefined) settings.brandStory.ctaLabel = brandStoryCtaLabel;
    if (brandStoryCtaLink !== undefined) settings.brandStory.ctaLink = brandStoryCtaLink;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, { folder: 'erimuga/homepage' });
      fs.unlinkSync(req.file.path);
      if (settings.brandStory.public_id) {
        await cloudinary.uploader.destroy(settings.brandStory.public_id).catch(() => {});
      }
      settings.brandStory.imageUrl = result.url;
      settings.brandStory.public_id = result.public_id;
    }

    await settings.save();
    res.status(200).json({ message: 'Homepage settings updated', settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update homepage settings', details: err.message });
  }
};

export default HomepageSettings;
