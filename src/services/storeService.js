// src/services/storeService.js
import prisma from '../config/database.js';

export class StoreService {
    /**
     * Récupérer tous les points de vente avec filtres
     */
    static async getAllStores(filters = {}) {
        const {
            postalCode,
            city,
            range,
            search,
            page = 1,
            limit = 50
        } = filters;

        const skip = (page - 1) * limit;

        const where = {
            isActive: true,
            ...(postalCode && {
                postalCode: { startsWith: postalCode }
            }),
            ...(city && {
                city: { equals: city, mode: 'insensitive' }
            }),
            ...(range && {
                ranges: { has: range }
            }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { city: { contains: search, mode: 'insensitive' } },
                    { address: { contains: search, mode: 'insensitive' } }
                ]
            })
        };

        const [stores, total] = await Promise.all([
            prisma.store.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: [
                    { isFeatured: 'desc' },
                    { name: 'asc' }
                ],
                include: {
                    products: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                            price: true
                        },
                        where: { isActive: true },
                        take: 5
                    }
                }
            }),
            prisma.store.count({ where })
        ]);

        return {
            stores,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Récupérer un point de vente par ID
     */
    static async getStoreById(id) {
        const store = await prisma.store.findUnique({
            where: { id },
            include: {
                products: {
                    where: { isActive: true },
                    orderBy: { name: 'asc' }
                }
            }
        });

        if (!store) {
            throw new Error('Point de vente non trouvé');
        }

        return store;
    }

    /**
     * Rechercher des points de vente par code postal et rayon
     * Utilisé pour la carte dans MapGoogle.jsx
     */
    static async searchStoresByLocation(postalCode, radius = 50, range = null) {
        const where = {
            isActive: true,
            postalCode: { startsWith: postalCode.substring(0, 2) }, // Département
            ...(range && range !== 'Tous' && { ranges: { has: range } })
        };

        const stores = await prisma.store.findMany({
            where,
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                address: true,
                city: true,
                postalCode: true,
                lat: true,
                lng: true,
                ranges: true,
                phone: true,
                googleMapsUrl: true,
                services: true
            }
        });

        // Calcul de distance (approximatif basé sur le code postal)
        // Pour une vraie distance GPS, utilisez la formule de Haversine
        return stores;
    }

    /**
     * Créer un nouveau point de vente
     */
    static async createStore(storeData) {
        const { productIds, ...data } = storeData;

        // Générer le slug depuis le nom
        const slug = data.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const store = await prisma.store.create({
            data: {
                ...data,
                slug,
                ...(productIds && {
                    products: {
                        connect: productIds.map(id => ({ id }))
                    }
                })
            },
            include: {
                products: true
            }
        });

        return store;
    }

    /**
     * Mettre à jour un point de vente
     */
    static async updateStore(id, storeData) {
        const { productIds, ...data } = storeData;

        const updateData = {
            ...data,
            ...(productIds && {
                products: {
                    set: productIds.map(id => ({ id }))
                }
            })
        };

        const store = await prisma.store.update({
            where: { id },
            data: updateData,
            include: {
                products: true
            }
        });

        return store;
    }

    /**
     * Supprimer un point de vente
     */
    static async deleteStore(id) {
        await prisma.store.delete({
            where: { id }
        });

        return { message: 'Point de vente supprimé avec succès' };
    }

    /**
     * Récupérer les points de vente à proximité (basé sur lat/lng)
     */
    static async getNearbyStores(lat, lng, radiusKm = 50) {
        // Récupérer tous les points de vente actifs
        const stores = await prisma.store.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                address: true,
                city: true,
                postalCode: true,
                lat: true,
                lng: true,
                ranges: true,
                phone: true,
                googleMapsUrl: true
            }
        });

        // Calculer la distance avec la formule de Haversine
        const storesWithDistance = stores.map(store => {
            const distance = this.calculateDistance(
                lat, lng,
                store.lat, store.lng
            );

            return {
                ...store,
                distance: Math.round(distance * 10) / 10 // Arrondi à 1 décimale
            };
        });

        // Filtrer par rayon et trier par distance
        return storesWithDistance
            .filter(store => store.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance);
    }

    /**
     * Formule de Haversine pour calculer la distance entre 2 points GPS
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Rayon de la Terre en km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    }

    static deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    /**
     * Obtenir les statistiques des points de vente
     */
    static async getStoreStats() {
        const [total, byRange, byCity] = await Promise.all([
            prisma.store.count({ where: { isActive: true } }),

            prisma.store.groupBy({
                by: ['ranges'],
                where: { isActive: true },
                _count: true
            }),

            prisma.store.groupBy({
                by: ['city'],
                where: { isActive: true },
                _count: true,
                orderBy: { _count: { city: 'desc' } },
                take: 10
            })
        ]);

        return {
            total,
            byRange,
            topCities: byCity
        };
    }
}