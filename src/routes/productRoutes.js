// src/routes/productRoutes.js
import express from 'express';
import { ProductController } from '../controllers/productController.js';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Récupérer tous les produits (avec filtres)
 * @query   ?category=Nettoyant&range=Pharmacie&skinType=grasse&inStock=true&search=hyfac&page=1&limit=20
 * @access  Public
 */
router.get('/', ProductController.getAllProducts);

/**
 * @route   GET /api/products/search/:term
 * @desc    Rechercher des produits
 * @param   term - Terme de recherche
 * @access  Public
 */
router.get('/search/:term', ProductController.searchProducts);

/**
 * @route   GET /api/products/category/:category
 * @desc    Récupérer les produits par catégorie
 * @param   category - Nom de la catégorie
 * @access  Public
 */
router.get('/category/:category', ProductController.getProductsByCategory);

/**
 * @route   GET /api/products/slug/:slug
 * @desc    Récupérer un produit par slug
 * @param   slug - Slug du produit
 * @access  Public
 */
router.get('/slug/:slug', ProductController.getProductBySlug);

/**
 * @route   GET /api/products/:id
 * @desc    Récupérer un produit par ID
 * @param   id - ID du produit
 * @access  Public
 */
router.get('/:id', ProductController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Créer un nouveau produit
 * @body    Product data (voir schema Prisma)
 * @access  Private (à sécuriser avec auth middleware)
 */
router.post('/', ProductController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Mettre à jour un produit
 * @param   id - ID du produit
 * @body    Product data to update
 * @access  Private (à sécuriser avec auth middleware)
 */
router.put('/:id', ProductController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Supprimer un produit
 * @param   id - ID du produit
 * @access  Private (à sécuriser avec auth middleware)
 */
router.delete('/:id', ProductController.deleteProduct);

export default router;