// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './src/config/database.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import productRoutes from './src/routes/productRoutes.js';
import storeRoutes from './src/routes/storeRoutes.js';

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// ====================================
// MIDDLEWARES
// ====================================

// CORS - Autoriser les requêtes depuis le frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Parser le body des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger les requêtes en développement
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// ====================================
// ROUTES
// ====================================

// Route de test
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API Hyfac Backend',
        version: '1.0.0',
        endpoints: {
            products: '/api/products',
            stores: '/api/stores',
            health: '/api/health'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Routes API
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);

// ====================================
// GESTION DES ERREURS
// ====================================

// Route non trouvée
app.use(notFoundHandler);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// ====================================
// DÉMARRAGE DU SERVEUR
// ====================================

const startServer = async () => {
    try {
        // Connexion à MongoDB via Prisma
        await connectDatabase();

        // Démarrer le serveur
        app.listen(PORT, () => {
            console.log('');
            console.log('='.repeat(50));
            console.log(`✅ Serveur démarré sur le port ${PORT}`);
            console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`📚 API Docs: http://localhost:${PORT}/api`);
            console.log('='.repeat(50));
            console.log('');
        });
    } catch (error) {
        console.error('❌ Erreur au démarrage du serveur:', error);
        process.exit(1);
    }
};

// Gestion de l'arrêt propre du serveur
process.on('SIGINT', async () => {
    console.log('\n🛑 Arrêt du serveur...');
    await disconnectDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Arrêt du serveur...');
    await disconnectDatabase();
    process.exit(0);
});

// Démarrer le serveur
startServer();