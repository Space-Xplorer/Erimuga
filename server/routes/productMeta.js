// routes/productMeta.js
import express from 'express';
import Product from '../models/productModel.js';

const router = express.Router();

// GET all unique category, apparelType, subcategory values
router.get('/metadata', async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        const apparelTypes = await Product.distinct('apparelType');
        const subcategories = await Product.distinct('subcategory');

        res.json({ categories, apparelTypes, subcategories });
    } catch (err) {
        console.error('Error fetching product metadata:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;