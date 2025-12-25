import { Dish } from './models/index.js';
import sequelize from './config/database.js';

const updates = [
    { nom: 'Salade César au Poulet', image: 'https://images.unsplash.com/photo-1546793665-c74683c3f43d?auto=format&fit=crop&w=800&q=80' },
    { nom: 'Houmous Artisanal', image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?auto=format&fit=crop&w=800&q=80' },
    { nom: 'Gambas à la Plancha', image: 'https://images.unsplash.com/photo-1559742811-180df14f0896?auto=format&fit=crop&w=800&q=80' },
    { nom: 'Filet de Bœuf Rossini', image: 'https://images.unsplash.com/photo-1558030006-45c2550dc7c3?auto=format&fit=crop&w=800&q=80' },
    { nom: 'Fondant au Chocolat Coeur Coulant', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80' },
    { nom: 'Tiramisu Speculoos', image: 'https://images.unsplash.com/photo-1547043536-fac94d3fd780?auto=format&fit=crop&w=800&q=80' }
];

const updateImages = async () => {
    try {
        console.log('🔄 Mise à jour des images des plats...');
        for (const update of updates) {
            const [affectedCount] = await Dish.update(
                { image: update.image },
                { where: { nom: update.nom } }
            );
            console.log(`✅ ${update.nom} : ${affectedCount > 0 ? 'Mis à jour' : 'Plat non trouvé'}`);
        }
        console.log('✨ Terminé !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur :', error);
        process.exit(1);
    }
};

updateImages();
