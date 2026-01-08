const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

// Charger les variables d'environnement
// On suppose qu'on lance le script depuis la racine, donc ./backend/.env
dotenv.config({ path: './backend/.env' });

// Imports des modèles (depuis la racine)
const Company = require('./backend/models/Company');
const Internship = require('./backend/models/Internship');

const seedData = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI manquant dans .env");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connecté à MongoDB');

        // 1. Créer une entreprise de démo
        const companyEmail = 'techcorp@demo.com';
        let company = await Company.findOne({ email: companyEmail });

        if (!company) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);

            company = await Company.create({
                companyName: 'TechCorp Solutions',
                email: companyEmail,
                password: hashedPassword,
                phone: '55123456',
                industry: 'Développement Logiciel',
                role: 'company',
                logoUrl: 'https://ui-avatars.com/api/?name=Tech+Corp&background=6366f1&color=fff'
            });
            console.log('🏢 Entreprise TechCorp créée');
        } else {
            console.log('ℹ️ Entreprise TechCorp existe déjà');
        }

        // 2. Créer des offres de stage
        const internshipsData = [
            {
                title: 'Développeur Fullstack MERN',
                field: 'Développement Web',
                type: 'Stage PFE',
                duration: 6,
                location: { city: 'Tunis', address: 'Les Berges du Lac 1' },
                description: `
**Rôle :**
Nous recherchons un stagiaire passionné pour rejoindre notre équipe de développement web. Vous participerez à la conception et au développement de nouvelles fonctionnalités pour notre plateforme SaaS.

**Missions :**
- Développement de composants React.js modernes et réactifs.
- Création d'API RESTful avec Node.js et Express.
- Collaboration avec l'équipe produit pour définir les spécifications.
- Participation aux revues de code et aux tests unitaires.

**Profil recherché :**
- Étudiant en fin de cursus (Ingénieur ou Master).
- Bonne maîtrise de JavaScript (ES6+).
- Connaissance de React et Node.js.
- Curiosité et envie d'apprendre.
                `,
                requiredLevel: 'Ingénieur',
                availableSpots: 2,
                companyId: company._id
            },
            {
                title: 'Designer UI/UX Mobile',
                field: 'Design UI/UX',
                type: 'Stage été',
                duration: 3,
                location: { city: 'Sousse', address: 'Sahloul' },
                description: `
**Rôle :**
Rejoignez notre équipe créative pour concevoir des expériences utilisateur exceptionnelles sur mobile.

**Missions :**
- Création de maquettes et prototypes interactifs sur Figma.
- Recherche utilisateur et tests d'usabilité.
- Collaboration avec les développeurs pour l'intégration des designs.
- Veille sur les tendances du design mobile.

**Profil recherché :**
- Portfolio démontrant des projets UI/UX.
- Maîtrise de Figma ou Adobe XD.
- Sensibilité à l'ergonomie et à l'accessibilité.
                `,
                requiredLevel: 'Licence 3',
                availableSpots: 1,
                companyId: company._id
            },
            {
                title: 'Assistant Marketing Digital',
                field: 'Marketing Digital',
                type: 'Stage été',
                duration: 2,
                location: { city: 'Ariana', address: 'Technopark El Ghazala' },
                description: `
**Rôle :**
Aidez-nous à booster notre présence en ligne et à engager notre communauté.

**Missions :**
- Gestion des réseaux sociaux (LinkedIn, Instagram).
- Création de contenu visuel et rédactionnel.
- Analyse des performances des campagnes.
- Veille concurrentielle.

**Profil recherché :**
- Passionné par le digital et les réseaux sociaux.
- Bonnes capacités rédactionnelles.
- Créativité et autonomie.
                `,
                requiredLevel: 'Licence 2',
                availableSpots: 1,
                companyId: company._id
            }
        ];

        // Supprimer les offres existantes de cette entreprise pour éviter les doublons
        await Internship.deleteMany({ companyId: company._id });

        await Internship.insertMany(internshipsData);
        console.log(`✨ ${internshipsData.length} stages créés avec succès !`);

        process.exit();
    } catch (error) {
        console.error('❌ Erreur seeding:', error);
        process.exit(1);
    }
};

seedData();
