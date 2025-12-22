// src/middleware/errorHandler.js

/**
 * Middleware de gestion globale des erreurs
 */
export const errorHandler = (err, req, res, next) => {
    console.error('❌ Erreur:', err);

    // Erreur Prisma - Enregistrement non trouvé
    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            message: 'Ressource non trouvée',
            error: err.meta?.cause || err.message,
            timestamp: new Date().toISOString()
        });
    }

    // Erreur Prisma - Contrainte unique violée
    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            message: 'Conflit: Un enregistrement avec ces données existe déjà',
            error: err.meta?.target || err.message,
            timestamp: new Date().toISOString()
        });
    }

    // Erreur de validation
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors: err.errors,
            timestamp: new Date().toISOString()
        });
    }

    // Erreur par défaut
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erreur interne du serveur';

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        timestamp: new Date().toISOString()
    });
};

/**
 * Middleware pour les routes non trouvées
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route non trouvée: ${req.method} ${req.url}`,
        timestamp: new Date().toISOString()
    });
};