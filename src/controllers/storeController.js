// src/controllers/storeController.js
import { StoreService } from '../services/storeService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class StoreController {
    /**
     * GET /api/stores
     * Récupérer tous les points de vente avec filtres
     */
    static async getAllStores(req, res, next) {
        try {
            const filters = {
                postalCode: req.query.postalCode,
                city: req.query.city,
                range: req.query.range,
                search: req.query.search,
                page: req.query.page || 1,
                limit: req.query.limit || 50
            };

            const result = await StoreService.getAllStores(filters);

            return ApiResponse.success(
                res,
                result,
                'Points de vente récupérés avec succès'
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/stores/:id
     * Récupérer un point de vente par ID
     */
    static async getStoreById(req, res, next) {
        try {
            const { id } = req.params;
            const store = await StoreService.getStoreById(id);

            return ApiResponse.success(
                res,
                store,
                'Point de vente récupéré avec succès'
            );
        } catch (error) {
            if (error.message === 'Point de vente non trouvé') {
                return ApiResponse.notFound(res, error.message);
            }
            next(error);
        }
    }

    /**
     * GET /api/stores/search/location
     * Rechercher des points de vente par localisation
     * Utilisé par MapGoogle.jsx
     */
    static async searchByLocation(req, res, next) {
        try {
            const { postalCode, radius, range } = req.query;

            if (!postalCode) {
                return ApiResponse.badRequest(
                    res,
                    'Le code postal est requis'
                );
            }

            const stores = await StoreService.searchStoresByLocation(
                postalCode,
                parseInt(radius) || 50,
                range
            );

            return ApiResponse.success(
                res,
                stores,
                `${stores.length} point(s) de vente trouvé(s)`
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/stores/nearby
     * Récupérer les points de vente à proximité (GPS)
     */
    static async getNearbyStores(req, res, next) {
        try {
            const { lat, lng, radius } = req.query;

            if (!lat || !lng) {
                return ApiResponse.badRequest(
                    res,
                    'Latitude et longitude sont requises'
                );
            }

            const stores = await StoreService.getNearbyStores(
                parseFloat(lat),
                parseFloat(lng),
                parseInt(radius) || 50
            );

            return ApiResponse.success(
                res,
                stores,
                `${stores.length} point(s) de vente trouvé(s) dans un rayon de ${radius || 50}km`
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/stores
     * Créer un nouveau point de vente
     */
    static async createStore(req, res, next) {
        try {
            const storeData = req.body;

            // Validation des données essentielles
            if (!storeData.name || !storeData.address || !storeData.city) {
                return ApiResponse.badRequest(
                    res,
                    'Nom, adresse et ville sont requis'
                );
            }

            if (!storeData.lat || !storeData.lng) {
                return ApiResponse.badRequest(
                    res,
                    'Coordonnées GPS (lat/lng) sont requises'
                );
            }

            const store = await StoreService.createStore(storeData);

            return ApiResponse.created(
                res,
                store,
                'Point de vente créé avec succès'
            );
        } catch (error) {
            if (error.code === 'P2002') {
                return ApiResponse.badRequest(
                    res,
                    'Un point de vente avec ce nom existe déjà'
                );
            }
            next(error);
        }
    }

    /**
     * PUT /api/stores/:id
     * Mettre à jour un point de vente
     */
    static async updateStore(req, res, next) {
        try {
            const { id } = req.params;
            const storeData = req.body;

            const store = await StoreService.updateStore(id, storeData);

            return ApiResponse.success(
                res,
                store,
                'Point de vente mis à jour avec succès'
            );
        } catch (error) {
            if (error.code === 'P2025') {
                return ApiResponse.notFound(res, 'Point de vente non trouvé');
            }
            next(error);
        }
    }

    /**
     * DELETE /api/stores/:id
     * Supprimer un point de vente
     */
    static async deleteStore(req, res, next) {
        try {
            const { id } = req.params;
            const result = await StoreService.deleteStore(id);

            return ApiResponse.success(
                res,
                result,
                'Point de vente supprimé avec succès'
            );
        } catch (error) {
            if (error.code === 'P2025') {
                return ApiResponse.notFound(res, 'Point de vente non trouvé');
            }
            next(error);
        }
    }

    /**
     * GET /api/stores/stats
     * Obtenir les statistiques des points de vente
     */
    static async getStoreStats(req, res, next) {
        try {
            const stats = await StoreService.getStoreStats();

            return ApiResponse.success(
                res,
                stats,
                'Statistiques récupérées avec succès'
            );
        } catch (error) {
            next(error);
        }
    }
}