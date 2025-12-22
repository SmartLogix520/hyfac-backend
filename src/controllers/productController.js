// src/controllers/productController.js
import { ProductService } from '../services/productService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ProductController {
    /**
     * GET /api/products
     * Récupérer tous les produits avec filtres
     */
    static async getAllProducts(req, res, next) {
        try {
            const filters = {
                category: req.query.category,
                range: req.query.range,
                skinType: req.query.skinType,
                inStock: req.query.inStock,
                search: req.query.search,
                page: req.query.page || 1,
                limit: req.query.limit || 20
            };

            const result = await ProductService.getAllProducts(filters);

            return ApiResponse.success(
                res,
                result,
                'Produits récupérés avec succès'
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/products/:id
     * Récupérer un produit par ID
     */
    static async getProductById(req, res, next) {
        try {
            const { id } = req.params;
            const product = await ProductService.getProductById(id);

            return ApiResponse.success(
                res,
                product,
                'Produit récupéré avec succès'
            );
        } catch (error) {
            if (error.message === 'Produit non trouvé') {
                return ApiResponse.notFound(res, error.message);
            }
            next(error);
        }
    }

    /**
     * GET /api/products/slug/:slug
     * Récupérer un produit par slug
     */
    static async getProductBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const product = await ProductService.getProductBySlug(slug);

            return ApiResponse.success(
                res,
                product,
                'Produit récupéré avec succès'
            );
        } catch (error) {
            if (error.message === 'Produit non trouvé') {
                return ApiResponse.notFound(res, error.message);
            }
            next(error);
        }
    }

    /**
     * POST /api/products
     * Créer un nouveau produit
     */
    static async createProduct(req, res, next) {
        try {
            const productData = req.body;

            // Générer le slug depuis le nom
            if (!productData.slug && productData.name) {
                productData.slug = productData.name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            const product = await ProductService.createProduct(productData);

            return ApiResponse.created(
                res,
                product,
                'Produit créé avec succès'
            );
        } catch (error) {
            if (error.code === 'P2002') {
                return ApiResponse.badRequest(
                    res,
                    'Un produit avec ce nom existe déjà'
                );
            }
            next(error);
        }
    }

    /**
     * PUT /api/products/:id
     * Mettre à jour un produit
     */
    static async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const productData = req.body;

            const product = await ProductService.updateProduct(id, productData);

            return ApiResponse.success(
                res,
                product,
                'Produit mis à jour avec succès'
            );
        } catch (error) {
            if (error.code === 'P2025') {
                return ApiResponse.notFound(res, 'Produit non trouvé');
            }
            next(error);
        }
    }

    /**
     * DELETE /api/products/:id
     * Supprimer un produit
     */
    static async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            const result = await ProductService.deleteProduct(id);

            return ApiResponse.success(
                res,
                result,
                'Produit supprimé avec succès'
            );
        } catch (error) {
            if (error.code === 'P2025') {
                return ApiResponse.notFound(res, 'Produit non trouvé');
            }
            next(error);
        }
    }

    /**
     * GET /api/products/category/:category
     * Récupérer les produits par catégorie
     */
    static async getProductsByCategory(req, res, next) {
        try {
            const { category } = req.params;
            const products = await ProductService.getProductsByCategory(category);

            return ApiResponse.success(
                res,
                products,
                `Produits de la catégorie ${category} récupérés`
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/products/search/:term
     * Rechercher des produits
     */
    static async searchProducts(req, res, next) {
        try {
            const { term } = req.params;
            const products = await ProductService.searchProducts(term);

            return ApiResponse.success(
                res,
                products,
                `${products.length} produit(s) trouvé(s)`
            );
        } catch (error) {
            next(error);
        }
    }
}