// prisma/seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Début du seed...');

    // ====================================
    // CRÉER DES PRODUITS
    // ====================================
    const products = await Promise.all([
        prisma.product.create({
            data: {
                name: 'HYFAC Mousse Nettoyante',
                slug: 'hyfac-mousse-nettoyante',
                description: 'Mousse nettoyante purifiante pour peaux grasses à tendance acnéique',
                shortDesc: 'Nettoie et purifie en douceur',
                category: 'Nettoyant',
                ranges: ['Parapharmacie', 'Pharmacie'],
                skinType: ['grasse', 'mixte', 'acnéique'],
                volume: '150ml',
                price: 12.90,
                activeIngredients: ['Acide salicylique', 'Zinc'],
                imageUrl: 'https://example.com/hyfac-mousse.jpg',
                images: ['https://example.com/hyfac-mousse-1.jpg'],
                usageInstructions: 'Appliquer matin et soir sur peau humide, masser puis rincer',
                benefits: ['Purifie', 'Élimine les impuretés', 'Matifie'],
                inStock: true,
                isActive: true
            }
        }),
        prisma.product.create({
            data: {
                name: 'HYFAC Crème Anti-Imperfections',
                slug: 'hyfac-creme-anti-imperfections',
                description: 'Crème de soin ciblée pour réduire les imperfections',
                shortDesc: 'Traite les imperfections',
                category: 'Soin',
                ranges: ['Pharmacie', 'Cosmétique'],
                skinType: ['grasse', 'acnéique'],
                volume: '40ml',
                price: 15.90,
                activeIngredients: ['Niacinamide', 'Zinc PCA'],
                imageUrl: 'https://example.com/hyfac-creme.jpg',
                images: [],
                usageInstructions: 'Appliquer localement sur les imperfections',
                benefits: ['Réduit les imperfections', 'Apaise', 'Matifie'],
                inStock: true,
                isActive: true
            }
        }),
        prisma.product.create({
            data: {
                name: 'HYFAC Gel Nettoyant Doux',
                slug: 'hyfac-gel-nettoyant-doux',
                description: 'Gel nettoyant quotidien pour peaux sensibles',
                shortDesc: 'Nettoie en douceur',
                category: 'Nettoyant',
                ranges: ['Parapharmacie'],
                skinType: ['sensible', 'mixte'],
                volume: '200ml',
                price: 10.50,
                activeIngredients: ['Aloe Vera', 'Glycérine'],
                imageUrl: 'https://example.com/hyfac-gel.jpg',
                images: [],
                usageInstructions: 'Appliquer matin et soir, masser puis rincer',
                benefits: ['Nettoie', 'Apaise', 'Hydrate'],
                inStock: true,
                isActive: true
            }
        })
    ]);

    console.log(`✅ ${products.length} produits créés`);

    // ====================================
    // CRÉER DES POINTS DE VENTE
    // ====================================
    const stores = await Promise.all([
        prisma.store.create({
            data: {
                name: 'GRANDE PHARMACIE PREMIERE',
                slug: 'grande-pharmacie-premiere',
                address: '24 BOULEVARD DE SEBASTOPOL',
                city: 'PARIS',
                postalCode: '75004',
                country: 'France',
                lat: 48.8606,
                lng: 2.3522,
                ranges: ['Parapharmacie', 'Pharmacie'],
                phone: '01 42 72 03 23',
                googleMapsUrl: 'https://maps.google.com/?q=48.8606,2.3522',
                services: ['Conseil pharmaceutique', 'Click & Collect'],
                isActive: true,
                isFeatured: true,
                products: {
                    connect: [{ id: products[0].id }, { id: products[1].id }]
                }
            }
        }),
        prisma.store.create({
            data: {
                name: 'PHARMACIE BADER',
                slug: 'pharmacie-bader',
                address: '10 12 BOULEVARD SAINT MICHEL',
                city: 'PARIS',
                postalCode: '75006',
                country: 'France',
                lat: 48.8506,
                lng: 2.3422,
                ranges: ['Pharmacie', 'Cosmétique'],
                phone: '01 43 26 92 66',
                googleMapsUrl: 'https://maps.google.com/?q=48.8506,2.3422',
                services: ['Conseil pharmaceutique', 'Livraison'],
                isActive: true,
                isFeatured: false,
                products: {
                    connect: [{ id: products[1].id }, { id: products[2].id }]
                }
            }
        }),
        prisma.store.create({
            data: {
                name: 'PHARMACIE DES TUILERIES',
                slug: 'pharmacie-des-tuileries',
                address: '5 RUE DES PYRAMIDES',
                city: 'PARIS',
                postalCode: '75001',
                country: 'France',
                lat: 48.8647,
                lng: 2.3320,
                ranges: ['Parapharmacie'],
                phone: '01 42 60 73 62',
                googleMapsUrl: 'https://maps.google.com/?q=48.8647,2.3320',
                services: ['Conseil pharmaceutique'],
                isActive: true,
                isFeatured: false,
                products: {
                    connect: [{ id: products[0].id }, { id: products[2].id }]
                }
            }
        })
    ]);

    console.log(`✅ ${stores.length} points de vente créés`);

    // ====================================
    // CRÉER DES CATÉGORIES
    // ====================================
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: 'Nettoyants',
                slug: 'nettoyants',
                description: 'Produits nettoyants pour le visage',
                order: 1,
                isActive: true
            }
        }),
        prisma.category.create({
            data: {
                name: 'Soins',
                slug: 'soins',
                description: 'Crèmes et soins du visage',
                order: 2,
                isActive: true
            }
        }),
        prisma.category.create({
            data: {
                name: 'Crèmes',
                slug: 'cremes',
                description: 'Crèmes hydratantes et traitantes',
                order: 3,
                isActive: true
            }
        })
    ]);

    console.log(`✅ ${categories.length} catégories créées`);

    console.log('');
    console.log('='.repeat(50));
    console.log('🎉 Seed terminé avec succès !');
    console.log('='.repeat(50));
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });