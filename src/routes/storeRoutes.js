// src/routes/storeRoutes.js
import express from 'express';
import { StoreController } from '../controllers/storeController.js';

const router = express.Router();

/**
 * @route   GET /api/stores
 * @desc    Récupérer tous les points de vente (avec filtres)
 * @query   ?postalCode=75004&city=Paris&range=Pharmacie&search=bader&page=1&limit=50
 * @access  Public
 */
router.get('/', StoreController.getAllStores);

/**
 * @route   GET /api/stores/stats
 * @desc    Obtenir les statistiques des points de vente
 * @access  Public
 */
router.get('/stats', StoreController.getStoreStats);

/**
 * @route   GET /api/stores/search/location
 * @desc    Rechercher des points de vente par code postal et rayon
 * @query   ?postalCode=75004&radius=50&range=Pharmacie
 * @access  Public
 * @usage   Pour MapGoogle.jsx - handleSearch()
 */
router.get('/search/location', StoreController.searchByLocation);

/**
 * @route   GET /api/stores/nearby
 * @desc    Récupérer les points de vente à proximité (GPS)
 * @query   ?lat=48.8566&lng=2.3522&radius=50
 * @access  Public
 * @usage   Pour géolocalisation utilisateur
 */
router.get('/nearby', StoreController.getNearbyStores);

/**
 * @route   GET /api/stores/:id
 * @desc    Récupérer un point de vente par ID
 * @param   id - ID du point de vente
 * @access  Public
 */
router.get('/:id', StoreController.getStoreById);

/**
 * @route   POST /api/stores
 * @desc    Créer un nouveau point de vente
 * @body    Store data (voir schema Prisma)
 * @access  Private (à sécuriser avec auth middleware)
 */
router.post('/', StoreController.createStore);

/**
 * @route   PUT /api/stores/:id
 * @desc    Mettre à jour un point de vente
 * @param   id - ID du point de vente
 * @body    Store data to update
 * @access  Private (à sécuriser avec auth middleware)
 */
router.put('/:id', StoreController.updateStore);

/**
 * @route   DELETE /api/stores/:id
 * @desc    Supprimer un point de vente
 * @param   id - ID du point de vente
 * @access  Private (à sécuriser avec auth middleware)
 */
router.delete('/:id', StoreController.deleteStore);

export default router;