// src/config/database.js
import { PrismaClient } from '@prisma/client';

// Instance unique de Prisma Client
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
});

// Gestion de la connexion
export const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Connexion à MongoDB réussie via Prisma');
    } catch (error) {
        console.error('❌ Erreur de connexion à MongoDB:', error);
        process.exit(1);
    }
};

// Gestion de la déconnexion propre
export const disconnectDatabase = async () => {
    await prisma.$disconnect();
    console.log('🔌 Déconnexion de MongoDB');
};

export default prisma;