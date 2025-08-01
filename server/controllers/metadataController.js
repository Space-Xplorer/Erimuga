// controllers/metadataController.js
import MainCategory from '../models/mainCategoryModel.js';
import ApparelType from '../models/apparelTypeModel.js';
import Subcategory from '../models/subCategoryModel.js';

export const getMetadata = async (req, res) => {
  try {
    const categories = await MainCategory.find().sort({ name: 1 });
    const apparelTypes = await ApparelType.find().sort({ name: 1 });
    const subcategories = await Subcategory.find().sort({ name: 1 });

    res.status(200).json({
      categories: categories.map(c => c.name),
      apparelTypes: apparelTypes.map(a => a.name),
      subcategories: subcategories.map(s => s.name),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load metadata' });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCat = new MainCategory({ name });
    await newCat.save();
    res.status(201).json({ message: 'Category added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add category' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const name = req.params.name;
    await MainCategory.findOneAndDelete({ name });
    res.status(200).json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

export const addApparelType = async (req, res) => {
  try {
    const { name } = req.body;
    const newApparel = new ApparelType({ name });
    await newApparel.save();
    res.status(201).json({ message: 'Apparel Type added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add apparel type' });
  }
};

export const deleteApparelType = async (req, res) => {
  try {
    const name = req.params.name;
    await ApparelType.findOneAndDelete({ name });
    res.status(200).json({ message: 'Apparel Type deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete apparel type' });
  }
};

export const addSubcategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newSub = new Subcategory({ name });
    await newSub.save();
    res.status(201).json({ message: 'Subcategory added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add subcategory' });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const name = req.params.name;
    await Subcategory.findOneAndDelete({ name });
    res.status(200).json({ message: 'Subcategory deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subcategory' });
  }
};
