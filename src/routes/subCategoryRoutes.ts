import express from 'express';
import { createSubcategory, getSubcategories, getSubcategories, deleteSubcategory } from '../controllers/subCategoryController';

const router = express.Router();

// Route to get all categories
router.get('/', getSubcategories);

// Route to create a new category
router.post('/create', createSubcategory);  // Assuming `checkAuth` ensures the user is authenticated

// Route to update an existing category

//router.put('/:cid', updateSubcategory);

router.put('/:cid', getSubcategories);

// Route to delete a category
router.delete('/:cid', deleteSubcategory);

export { router as subCategoryRoutes };
