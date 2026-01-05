// src/services/productService.js
import prisma from '../config/database.js';

export class ProductService {
    /**
     * Récupérer tous les produits avec filtres
     */
// src/services/productService.js
    static async getAllProducts(filters = {}) {
        const {
            category,
            range,
            skinType,
            inStock,
            search,
            minPrice,
            maxPrice,
            sortBy = 'default',
            page = 1,
            limit = 20
        } = filters;

        const skip = (page - 1) * limit;

        const where = {
            isActive: true,
            ...(category && { category }),
            ...(range && { ranges: { has: range } }),
            ...(skinType && { skinType: { has: skinType } }),
            ...(inStock !== undefined && { inStock: inStock === 'true' }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            }),
            // Filtres de prix
            ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
            ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
            // Si les deux sont présents
            ...(minPrice && maxPrice && {
                price: {
                    gte: parseFloat(minPrice),
                    lte: parseFloat(maxPrice)
                }
            })
        };

        // Gestion du tri
        let orderBy = { createdAt: 'desc' }; // Par défaut

        switch (sortBy) {
            case 'price-asc':
                orderBy = { price: 'asc' };
                break;
            case 'price-desc':
                orderBy = { price: 'desc' };
                break;
            case 'name-asc':
                orderBy = { name: 'asc' };
                break;
            case 'name-desc':
                orderBy = { name: 'desc' };
                break;
            case 'newest':
                orderBy = { createdAt: 'desc' };
                break;
            default:
                orderBy = { createdAt: 'desc' };
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy,
                include: {
                    stores: {
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            postalCode: true
                        }
                    }
                }
            }),
            prisma.product.count({ where })
        ]);

        return {
            products,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Récupérer un produit par ID
     */
    static async getProductById(id) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                stores: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        city: true,
                        postalCode: true,
                        phone: true,
                        lat: true,
                        lng: true
                    }
                }
            }
        });

        if (!product) {
            throw new Error('Produit non trouvé');
        }

        return product;
    }

    /**
     * Récupérer un produit par slug
     */
    static async getProductBySlug(slug) {
        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                stores: true
            }
        });

        if (!product) {
            throw new Error('Produit non trouvé');
        }

        return product;
    }

    /**
     * Créer un nouveau produit
     */
    static async createProduct(productData) {
        const { storeIds, ...data } = productData;

        const product = await prisma.product.create({
            data: {
                ...data,
                ...(storeIds && {
                    stores: {
                        connect: storeIds.map(id => ({ id }))
                    }
                })
            },
            include: {
                stores: true
            }
        });

        return product;
    }

    /**
     * Mettre à jour un produit
     */
    static async updateProduct(id, productData) {
        const { storeIds, ...data } = productData;

        const updateData = {
            ...data,
            ...(storeIds && {
                stores: {
                    set: storeIds.map(id => ({ id }))
                }
            })
        };

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                stores: true
            }
        });

        return product;
    }

    /**
     * Supprimer un produit
     */
    static async deleteProduct(id) {
        await prisma.product.delete({
            where: { id }
        });

        return { message: 'Produit supprimé avec succès' };
    }

    /**
     * Récupérer les produits par catégorie
     */
    static async getProductsByCategory(category) {
        const products = await prisma.product.findMany({
            where: {
                category,
                isActive: true
            },
            orderBy: { name: 'asc' }
        });

        return products;
    }

    /**
     * Rechercher des produits
     */
    static async searchProducts(searchTerm) {
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { description: { contains: searchTerm, mode: 'insensitive' } },
                    { category: { contains: searchTerm, mode: 'insensitive' } }
                ]
            },
            take: 20
        });

        return products;
    }
}