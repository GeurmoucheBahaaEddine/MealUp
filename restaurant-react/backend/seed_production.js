import sequelize from './config/database.js';
import { User, Dish, Ingredient, DishIngredient } from './models/index.js';
import bcrypt from 'bcryptjs';

const seedProduction = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('✅ Base de données réinitialisée.');

        // 1. Création de l'administrateur
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            nom: 'Bahaa Eddine',
            email: 'admin@example.com',
            adresse: 'Restaurant MealUp HQ',
            password_hash: hashedPassword,
            role: 'admin'
        });
        console.log('✅ Compte administrateur créé.');

        // 2. Définition des ingrédients
        const ingredientData = [
            { nom: 'Poulet Frais', prix: 200 },
            { nom: 'Agneau de Qualité', prix: 500 },
            { nom: 'Boeuf Haché', prix: 300 },
            { nom: 'Saumon Frais', prix: 600 },
            { nom: 'Crevettes Décortiquées', prix: 450 },
            { nom: 'Fromage de Chèvre', prix: 150 },
            { nom: 'Mozzarella di Bufala', prix: 200 },
            { nom: 'Huile d\'Olive Extra Vierge', prix: 50 },
            { nom: 'Ail Frais', prix: 20 },
            { nom: 'Basilic Frais', prix: 30 },
            { nom: 'Safran Pur', prix: 800 },
            { nom: 'Pois Chiches', prix: 40 },
            { nom: 'Semoule Fine', prix: 60 },
            { nom: 'Légumes de Saison', prix: 100 },
            { nom: 'Avocat Écrasé', prix: 150 },
            { nom: 'Miel Sauvage', prix: 120 },
            { nom: 'Amandes Grillées', prix: 100 },
            { nom: 'Noix de Grenoble', prix: 130 },
            { nom: 'Chocolat Noir 70%', prix: 180 },
            { nom: 'Pistaches d\'Iran', prix: 250 },
            { nom: 'Riz Basmati', prix: 80 },
            { nom: 'Frites Maison', prix: 100 },
        ];

        const ingredients = {};
        for (const item of ingredientData) {
            ingredients[item.nom] = await Ingredient.create(item);
        }
        console.log('✅ Ingrédients enregistrés.');

        // 3. Définition des plats (Pas de porc, pas d'alcool)
        const dishData = [
            // --- ENTRÉES ---
            {
                nom: 'Salade César au Poulet',
                prix: 1400,
                categorie: 'Entrées',
                description: 'Cœurs de laitue romaine, blancs de poulet grillés, croûtons à l\'ail et sauce César maison sans alcool.',
                image_url: 'https://images.unsplash.com/photo-1546793665-c74683c3f43d?auto=format&fit=crop&w=800&q=80',
                ingredients: ['Poulet Frais', 'Ail Frais', 'Huile d\'Olive Extra Vierge']
            },
            {
                nom: 'Houmous Artisanal',
                prix: 800,
                categorie: 'Entrées',
                description: 'Onctueuse purée de pois chiches au tahini, jus de citron et huile d\'olive vierge, servi avec pain pita.',
                image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?auto=format&fit=crop&w=800&q=80',
                ingredients: ['Pois Chiches', 'Huile d\'Olive Extra Vierge', 'Ail Frais']
            },
            {
                nom: 'Burrata Crémeuse & Tomates',
                prix: 1600,
                categorie: 'Entrées',
                description: 'Burrata de 125g, tomates cerises confites, pesto de basilic frais et pignons de pin.',
                image_url: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd679?q=80&w=800',
                ingredients: ['Mozzarella di Bufala', 'Basilic Frais', 'Huile d\'Olive Extra Vierge']
            },
            {
                nom: 'Gambas à la Plancha',
                prix: 1900,
                categorie: 'Entrées',
                description: 'Gambas marinées à l\'ail et au persil, saisies vivement à la plancha.',
                image_url: 'https://images.unsplash.com/photo-1559742811-180df14f0896?auto=format&fit=crop&w=800&q=80',
                ingredients: ['Crevettes Décortiquées', 'Ail Frais', 'Huile d\'Olive Extra Vierge']
            },
            {
                nom: 'Carpaccio de Boeuf',
                prix: 1700,
                categorie: 'Entrées',
                description: 'Fines tranches de filet de bœuf, copeaux de parmesan, roquette et huile de truffe.',
                image_url: 'https://images.unsplash.com/photo-1615814510009-8bc85934446c?q=80&w=800',
                ingredients: ['Boeuf Haché', 'Huile d\'Olive Extra Vierge']
            },
            {
                nom: 'Soupe à l\'Oignon Gratinée',
                prix: 900,
                categorie: 'Entrées',
                description: 'Soupe à l\'oignon traditionnelle, bouillon de boeuf maison, croûtons et fromage gratiné.',
                image_url: 'https://images.unsplash.com/photo-1583953412532-4fe0d0d80115?q=80&w=800',
                ingredients: ['Ail Frais', 'Mozzarella di Bufala']
            },
            {
                nom: 'Samoussas aux Légumes',
                prix: 750,
                categorie: 'Entrées',
                description: 'Triangles croustillants farcis aux légumes de saison et épices douces.',
                image_url: 'https://images.unsplash.com/photo-1601050633647-81a35d377a66?q=80&w=800',
                ingredients: ['Légumes de Saison', 'Huile d\'Olive Extra Vierge']
            },
            {
                nom: 'Avocat aux Crevettes',
                prix: 1300,
                categorie: 'Entrées',
                description: 'Avocat mûr à point garni de crevettes roses et sauce cocktail maison.',
                image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800',
                ingredients: ['Avocat Écrasé', 'Crevettes Décortiquées']
            },

            // --- PLATS PRINCIPAUX ---
            {
                nom: 'Couscous Impérial',
                prix: 2800,
                categorie: 'Plats principaux',
                description: 'Semoule fine, méchoui d\'agneau, merguez de boeuf, poulet et légumes variés.',
                image_url: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?q=80&w=800',
                ingredients: ['Semoule Fine', 'Agneau de Qualité', 'Poulet Frais', 'Légumes de Saison'],
                is_popular: true
            },
            {
                nom: 'Tajine d\'Agneau aux Pruneaux',
                prix: 2600,
                categorie: 'Plats principaux',
                description: 'Agneau mijoté lentement avec pruneaux, amandes grillées et cannelle.',
                image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800',
                ingredients: ['Agneau de Qualité', 'Amandes Grillées', 'Safran Pur']
            },
            {
                nom: 'Filet de Bœuf Rossini',
                prix: 3800,
                categorie: 'Plats principaux',
                description: 'Pavé de bœuf, foie gras poêlé, servi sur toast avec sauce madère déglacée au jus de raisin.',
                image_url: 'https://images.unsplash.com/photo-1558030006-45c2550dc7c3?auto=format&fit=crop&w=800&q=80',
                ingredients: ['Boeuf Haché', 'Huile d\'Olive Extra Vierge']
            },
            {
                nom: 'Saumon Grillé à l\'Aneth',
                prix: 2400,
                categorie: 'Plats principaux',
                description: 'Pavé de saumon frais, riz basmati et sauce yaourt à l\'aneth.',
                image_url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=800',
                ingredients: ['Saumon Frais', 'Riz Basmati', 'Légumes de Saison']
            },
            {
                nom: 'Paella Royale (Sans Porc)',
                prix: 2900,
                categorie: 'Plats principaux',
                description: 'Riz au safran, crevettes, calamars, moules et poulet fermier.',
                image_url: 'https://images.unsplash.com/photo-1534080564607-c98eb8ccb451?q=80&w=800',
                ingredients: ['Safran Pur', 'Crevettes Décortiquées', 'Poulet Frais', 'Riz Basmati']
            },
            {
                nom: 'Pizza Burrata & Truffe',
                prix: 2200,
                categorie: 'Plats principaux',
                description: 'Base crème de truffe, mozzarella fior di latte, après cuisson : burrata et huile de truffe.',
                image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800',
                ingredients: ['Mozzarella di Bufala', 'Huile d\'Olive Extra Vierge', 'Basilic Frais'],
                is_new: true
            },
            {
                nom: 'Burger Tasty MealUp',
                prix: 1950,
                categorie: 'Plats principaux',
                description: 'Boeuf 180g, fromage de chèvre, miel, noix, oignons caramélisés et frites maison.',
                image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800',
                ingredients: ['Boeuf Haché', 'Fromage de Chèvre', 'Miel Sauvage', 'Frites Maison'],
                is_popular: true
            },
            {
                nom: 'Poulet Tikka Masala',
                prix: 1800,
                categorie: 'Plats principaux',
                description: 'Morceaux de poulet marinés puis cuits dans une sauce tomate crémeuse aux épices indiennes.',
                image_url: 'https://images.unsplash.com/photo-1565557623262-b51c3513a641?q=80&w=800',
                ingredients: ['Poulet Frais', 'Riz Basmati', 'Ail Frais']
            },
            {
                nom: 'Lasagnes de Boeuf Maison',
                prix: 1750,
                categorie: 'Plats principaux',
                description: 'Pâtes fraîches, sauce bolognaise au boeuf pur, béchamel et parmesan gratiné.',
                image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800',
                ingredients: ['Boeuf Haché', 'Mozzarella di Bufala', 'Ail Frais']
            },
            {
                nom: 'Risotto aux Champignons des Bois',
                prix: 1900,
                categorie: 'Plats principaux',
                description: 'Riz arborio crémeux, mélange de champignons sauvages, parmesan et persillade.',
                image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=800',
                ingredients: ['Riz Basmati', 'Ail Frais', 'Huile d\'Olive Extra Vierge']
            },
            {
                nom: 'Entrecôte Grillée (300g)',
                prix: 3200,
                categorie: 'Plats principaux',
                description: 'Pièce de boeuf sélectionnée, grillée à votre convenance, servie avec frites et salade.',
                image_url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=800',
                ingredients: ['Boeuf Haché', 'Frites Maison', 'Légumes de Saison']
            },
            {
                nom: 'Pasta aux Fruits de Mer',
                prix: 2300,
                categorie: 'Plats principaux',
                description: 'Spaghetti aux palourdes, crevettes et calamars, sauce tomate légère au basilic.',
                image_url: 'https://images.unsplash.com/photo-1563379091339-0ef4b1a09d91?q=80&w=800',
                ingredients: ['Crevettes Décortiquées', 'Huile d\'Olive Extra Vierge', 'Basilic Frais']
            },
            {
                nom: 'Brochettes d\'Agneau Kefta',
                prix: 1850,
                categorie: 'Plats principaux',
                description: 'Bœuf et agneau hachés aux herbes, grillés au feu de bois, servi avec boulghour.',
                image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=800',
                ingredients: ['Agneau de Qualité', 'Boeuf Haché', 'Ail Frais']
            },
            {
                nom: 'Souris d\'Agneau de 7 Heures',
                prix: 2850,
                categorie: 'Plats principaux',
                description: 'Souris d\'agneau confite pendant 7 heures, jus corsé au romarin, purée maison.',
                image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800',
                ingredients: ['Agneau de Qualité', 'Légumes de Saison']
            },
            {
                nom: 'Wok de Poulet aux Noix de Cajou',
                prix: 1900,
                categorie: 'Plats principaux',
                description: 'Émincé de poulet sauté au wok avec légumes croquants et sauce soja.',
                image_url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=800',
                ingredients: ['Poulet Frais', 'Légumes de Saison', 'Noix de Grenoble']
            },

            // --- DESSERTS ---
            {
                nom: 'Fondant au Chocolat Coeur Coulant',
                prix: 950,
                categorie: 'Desserts',
                description: 'Gâteau au chocolat noir intense, cœur fondant, servi avec une boule de glace vanille.',
                image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80',
                ingredients: ['Chocolat Noir 70%'],
                is_popular: true
            },
            {
                nom: 'Tiramisu Speculoos',
                prix: 850,
                categorie: 'Desserts',
                description: 'Variation du dessert italien avec des biscuits speculoos et café Arabica.',
                image_url: 'https://images.unsplash.com/photo-1547043536-fac94d3fd780?auto=format&fit=crop&w=800&q=80',
                ingredients: ['Chocolat Noir 70%']
            },
            {
                nom: 'Pâtisseries Orientales Assorties',
                prix: 1100,
                categorie: 'Desserts',
                description: 'Sélection de baklavas, cornes de gazelle et makrouts au miel et amandes.',
                image_url: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=800',
                ingredients: ['Miel Sauvage', 'Amandes Grillées', 'Pistaches d\'Iran']
            },
            {
                nom: 'Cheesecake aux Fruits Rouges',
                prix: 980,
                categorie: 'Desserts',
                description: 'New York Cheesecake crémeux sur biscuit croustillant et coulis de framboises.',
                image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800',
                ingredients: ['Frites Maison'] // Simili for biscuit base
            },
            {
                nom: 'Crème Brûlée à la Vanille Bleue',
                prix: 900,
                categorie: 'Desserts',
                description: 'Crème onctueuse à la vanille de la Réunion, cassonade caramélisée au chalumeau.',
                image_url: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?q=80&w=800',
                ingredients: ['Safran Pur'] // Hint of complexity
            },
            {
                nom: 'Tatin de Mangue & Coco',
                prix: 1050,
                categorie: 'Desserts',
                description: 'Mangues caramélisées sur pâte feuilletée, sorbet coco et zeste de citron vert.',
                image_url: 'https://images.unsplash.com/photo-1541783245831-57d6fb81734a?q=80&w=800',
                ingredients: ['Miel Sauvage']
            },
            {
                nom: 'Mousse au Chocolat Royale',
                prix: 780,
                categorie: 'Desserts',
                description: 'Mousse légère au chocolat noir 72%, éclats de fèves de cacao et fleur de sel.',
                image_url: 'https://images.unsplash.com/photo-1528451634235-9538c8672900?q=80&w=800',
                ingredients: ['Chocolat Noir 70%']
            },
            {
                nom: 'Assiette de Fruits de Saison',
                prix: 850,
                categorie: 'Desserts',
                description: 'Déclinaison de fruits frais découpés servie avec un sirop de menthe.',
                image_url: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=800',
                ingredients: ['Légumes de Saison'] // Reuse for simplicity
            },

            // --- BOISSONS ---
            {
                nom: 'Limonade Maison Menthe-Gingembre',
                prix: 550,
                categorie: 'Boissons',
                description: 'Rafraîchissement naturel pressé à froid, menthe fraîche et gingembre.',
                image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800',
                ingredients: ['Ail Frais'] // Ginger placeholder
            },
            {
                nom: 'Thé à la Menthe Fraîche',
                prix: 350,
                categorie: 'Boissons',
                description: 'Thé vert Gunpowder, menthe fraîchement cueillie et sucre selon tradition.',
                image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800',
                ingredients: ['Basilic Frais'] // Mint placeholder
            },
            {
                nom: 'Mojito Virgin (Sans Alcool)',
                prix: 750,
                categorie: 'Boissons',
                description: 'Limonade premium, menthe fraîche, citron vert et sucre de canne.',
                image_url: 'https://images.unsplash.com/photo-1546173159-31c124de9157?q=80&w=800',
                ingredients: ['Basilic Frais']
            },
            {
                nom: 'Smoothie Exotique',
                prix: 650,
                categorie: 'Boissons',
                description: 'Mix fruité de mangue, passion et ananas frais.',
                image_url: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?q=80&w=800',
                ingredients: ['Légumes de Saison']
            },
            {
                nom: 'Café Gourmand',
                prix: 950,
                categorie: 'Boissons',
                description: 'Un espresso accompagné de trois mini desserts du moment.',
                image_url: 'https://images.unsplash.com/photo-1541167760496-162955ed2a9f?q=80&w=800',
                ingredients: ['Chocolat Noir 70%', 'Amandes Grillées']
            },
            {
                nom: 'Eaux Minérales (75cl)',
                prix: 450,
                categorie: 'Boissons',
                description: 'Plate ou gazeuse selon votre préférence.',
                image_url: 'https://images.unsplash.com/photo-1523362628242-f513a50d2e5a?q=80&w=800',
                ingredients: []
            },
            {
                nom: 'Jus de Mangue Pressé',
                prix: 600,
                categorie: 'Boissons',
                description: 'Jus de mangue 100% pur fruit sans sucres ajoutés.',
                image_url: 'https://images.unsplash.com/photo-1506802913710-40e2e66339c9?q=80&w=800',
                ingredients: []
            },
            {
                nom: 'Cocktail Signature MealUp',
                prix: 850,
                categorie: 'Boissons',
                description: 'Mélange secret de fruits rouges, sirop de violette et eau pétillante pétillante.',
                image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=800',
                ingredients: ['Miel Sauvage'],
                is_new: true
            }
        ];

        for (const data of dishData) {
            const { ingredients: dishIngredients, ...dishInfo } = data;
            const dish = await Dish.create(dishInfo);

            if (dishIngredients && dishIngredients.length > 0) {
                for (const ingNom of dishIngredients) {
                    const ingredient = ingredients[ingNom];
                    if (ingredient) {
                        await DishIngredient.create({
                            dish_id: dish.id,
                            ingredient_id: ingredient.id,
                            is_extra: false
                        });
                    }
                }
            }
        }

        console.log(`✅ ${dishData.length} plats créés avec succès.`);
        console.log('\n🎉 Le menu Halal (sans porc ni alcool) est prêt !');
        console.log('📝 Administrateur : admin@example.com / admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors du seeding :', error);
        process.exit(1);
    }
};

seedProduction();
