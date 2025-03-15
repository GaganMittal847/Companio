import express from 'express';
import { getListOfSellers } from '../controllers/sellerController'

const router = express.Router();

// Route to get all sellers
router.get('/', getListOfSellers);

export { router as sellerRoutes };
