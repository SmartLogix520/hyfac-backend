// prisma/importStores.js
import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

// Mapping Commune → Wilaya + Coordonnées précises
const COMMUNE_TO_WILAYA = {
    // Alger et ses communes
    "Cheraga": { wilaya: "Alger", lat: 36.6175, lng: 2.9614 },
    "Delly Brahim": { wilaya: "Alger", lat: 36.7267, lng: 2.9869 },
    "Bouzareha": { wilaya: "Alger", lat: 36.7850, lng: 3.0319 },
    "Bouzareah": { wilaya: "Alger", lat: 36.7850, lng: 3.0319 },
    "Chevaley": { wilaya: "Alger", lat: 36.7333, lng: 3.0833 },
    "Choueley": { wilaya: "Alger", lat: 36.7333, lng: 3.0833 },
    "El Biar": { wilaya: "Alger", lat: 36.7667, lng: 3.0167 },
    "Ben Aknoun": { wilaya: "Alger", lat: 36.7167, lng: 3.0167 },
    "Ben Messous": { wilaya: "Alger", lat: 36.7333, lng: 2.9833 },
    "Draria": { wilaya: "Alger", lat: 36.7167, lng: 2.9833 },
    "Douera": { wilaya: "Alger", lat: 36.6667, lng: 2.9333 },
    "Baba hassen": { wilaya: "Alger", lat: 36.6833, lng: 2.9667 },
    "El Achour": { wilaya: "Alger", lat: 36.7333, lng: 2.9500 },
    "Ain Benian": { wilaya: "Alger", lat: 36.8000, lng: 2.9167 },
    "Zeralda": { wilaya: "Alger", lat: 36.7167, lng: 2.8333 },
    "Staoueli": { wilaya: "Alger", lat: 36.7500, lng: 2.8833 },

    // Wilayas principales
    "Chlef": { wilaya: "Chlef", lat: 36.1647, lng: 1.3347 },
    "Ain defla": { wilaya: "Ain Defla", lat: 36.2639, lng: 1.9678 },
    "Khemis meliana": { wilaya: "Ain Defla", lat: 36.2639, lng: 2.2167 },
    "Medea": { wilaya: "Médéa", lat: 36.2639, lng: 2.7539 },
    "Ksar El boukhari": { wilaya: "Médéa", lat: 35.8833, lng: 2.7500 },
    "El Barrougha": { wilaya: "Médéa", lat: 36.1500, lng: 2.8000 },
    "Tiaret": { wilaya: "Tiaret", lat: 35.3711, lng: 1.3225 },
    "Tiarot (Sougueur)": { wilaya: "Tiaret", lat: 35.1889, lng: 1.4967 },
    "Saida": { wilaya: "Saïda", lat: 34.8417, lng: 0.1500 },
    "Ouled Djellal": { wilaya: "Biskra", lat: 34.4142, lng: 4.9656 },
    "Birtouta": { wilaya: "Alger", lat: 36.6333, lng: 3.0000 },
    "Sriaoua": { wilaya: "Tipaza", lat: 36.5000, lng: 2.3833 },
    "Meftah": { wilaya: "Blida", lat: 36.6208, lng: 3.2228 },
    "Larbaâ": { wilaya: "Blida", lat: 36.5667, lng: 3.1547 },
    "Blida": { wilaya: "Blida", lat: 36.4703, lng: 2.8277 },
    "Boufarik": { wilaya: "Blida", lat: 36.5750, lng: 2.9111 },
    "Kolea": { wilaya: "Tipaza", lat: 36.6369, lng: 2.7692 },
    "Bousmail": { wilaya: "Tipaza", lat: 36.6431, lng: 2.6861 },
    "El Hadjout": { wilaya: "Tipaza", lat: 36.5167, lng: 2.4167 },
    "Tipaza": { wilaya: "Tipaza", lat: 36.5892, lng: 2.4475 },
    "Sidi Abdellah": { wilaya: "Alger", lat: 36.7167, lng: 2.8667 },
    "Mhama": { wilaya: "Mascara", lat: 35.5000, lng: 0.2667 },
    "Oran": { wilaya: "Oran", lat: 35.6969, lng: -0.6331 },
    "Tassemssilt": { wilaya: "Tissemsilt", lat: 35.6050, lng: 1.8111 },
    "Batna": { wilaya: "Batna", lat: 35.5559, lng: 6.1742 },
    "Sétif": { wilaya: "Sétif", lat: 36.1905, lng: 5.4106 },
    "Constantine": { wilaya: "Constantine", lat: 36.3650, lng: 6.6147 },
    "Annaba": { wilaya: "Annaba", lat: 36.9000, lng: 7.7667 }
};

// Géocodage avec Nominatim (OpenStreetMap)
async function getCoordinates(pharmacyName, commune) {
    // D'abord, récupérer les données de la commune
    const communeData = getCommuneData(commune);

    try {
        // Essayer le géocodage avec nom + commune + wilaya
        const query = encodeURIComponent(`${pharmacyName}, ${commune}, ${communeData.wilaya}, Algeria`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=dz`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'HyfacApp/1.0 (contact@hyfac.dz)'
            }
        });

        const data = await response.json();

        if (data && data.length > 0) {
            console.log(`   ✓ Coordonnées trouvées via géocodage`);
            return {
                wilaya: communeData.wilaya,
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                address: `${commune}, ${communeData.wilaya}`
            };
        }

        // Fallback : utiliser les coordonnées de la commune
        console.log(`   ⚠ Géocodage échoué, utilisation des coordonnées de ${commune}`);
        return communeData;

    } catch (error) {
        console.log(`   ⚠ Erreur géocodage, utilisation des coordonnées de ${commune}`);
        return communeData;
    }
}

// Obtenir les coordonnées et wilaya d'une commune
function getCommuneData(commune) {
    const data = COMMUNE_TO_WILAYA[commune];

    if (data) {
        return {
            wilaya: data.wilaya,
            lat: data.lat,
            lng: data.lng,
            address: `${commune}, ${data.wilaya}`
        };
    }

    // Fallback : centre d'Alger par défaut
    console.log(`   ⚠️  Commune "${commune}" non trouvée dans la base, utilisation d'Alger`);
    return {
        wilaya: "Alger",
        lat: 36.7538,
        lng: 3.0588,
        address: `${commune}, Alger`
    };
}

// Générer un slug unique
function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Déterminer les gammes de produits disponibles
function extractRanges(row) {
    const ranges = [];

    // Vérifier les colonnes de produits (colonnes C à P dans votre Excel)
    const hasProducts =
        row['Gel'] || row['Mousse'] || row['SG'] || row['E. fluide'] ||
        row['Patchs'] || row['Gommage'] || row['A Mask'] || row['Sun INV'] ||
        row['Sun T'] || row['H. Légère'] || row['H. Riche'] || row['Clarifao'];

    if (hasProducts) {
        ranges.push('Parapharmacie');
        ranges.push('Cosmétique');
    }

    // Par défaut, toutes sont des pharmacies
    ranges.push('Pharmacie');

    return [...new Set(ranges)]; // Supprimer les doublons
}

// Parser le fichier Excel
function parseExcelFile(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Première feuille
    const worksheet = workbook.Sheets[sheetName];

    // Convertir en JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    return data;
}

// Mapper les données Excel vers le format Prisma
async function mapStoreData(row, index) {
    const name = row['Pharmacie / parapharmacie']?.trim();
    const commune = row['Adresse']?.trim();

    if (!name || !commune) {
        throw new Error('Nom ou commune manquant');
    }

    console.log(`📍 [${index}] Traitement: ${name}, ${commune}`);

    // Obtenir les coordonnées GPS, l'adresse et la wilaya
    const location = await getCoordinates(name, commune);

    // Délai pour respecter rate limit (1 req/sec)
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Extraire les gammes de produits
    const ranges = extractRanges(row);

    return {
        name,
        slug: `${generateSlug(name)}-${commune.toLowerCase().replace(/\s+/g, '-')}`,
        address: location.address,
        city: location.wilaya, // ✅ Stocker la WILAYA, pas la commune
        postalCode: '00000',
        country: 'Algérie',
        lat: location.lat,
        lng: location.lng,
        ranges,
        phone: null,
        email: null,
        website: null,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`,
        services: ['Conseil pharmaceutique'],
        isActive: true,
        isFeatured: false
    };
}

// Fonction principale d'importation
async function importStores() {
    try {
        console.log('🚀 Début de l\'importation des points de vente HYFAC...\n');

        // Lire le fichier Excel
        const filePath = './prisma/Points de vente HYFAC.xlsx';
        const rows = parseExcelFile(filePath);

        console.log(`📊 ${rows.length} lignes trouvées dans le fichier Excel\n`);

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // Importer chaque ligne
        for (let i = 0; i < rows.length; i++) {
            try {
                const storeData = await mapStoreData(rows[i], i + 1);

                // Vérifier si le point existe déjà
                const existing = await prisma.store.findUnique({
                    where: { slug: storeData.slug }
                });

                if (existing) {
                    console.log(`   ⚠️  Point existant ignoré\n`);
                    continue;
                }

                // Créer le point de vente
                await prisma.store.create({
                    data: storeData
                });

                successCount++;
                console.log(`   ✅ Importé avec succès\n`);

            } catch (error) {
                errorCount++;
                errors.push({ ligne: i + 1, erreur: error.message });
                console.error(`   ❌ Erreur: ${error.message}\n`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`✅ IMPORTATION TERMINÉE`);
        console.log(`   • Points importés: ${successCount}`);
        console.log(`   • Erreurs: ${errorCount}`);
        console.log('='.repeat(60));

        if (errors.length > 0) {
            console.log('\n❌ Détail des erreurs:');
            errors.forEach(e => console.log(`   Ligne ${e.ligne}: ${e.erreur}`));
        }

    } catch (error) {
        console.error('❌ Erreur fatale:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter l'importation
importStores();