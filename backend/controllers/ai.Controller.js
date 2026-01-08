const { getModel } = require('../config/gemini');

// @desc    Générer une description de stage AI
// @route   POST /api/ai/generate-description
// @access  Private (Company)
exports.generateInternshipDescription = async (req, res) => {
    const { title, field, duration, skills } = req.body;

    if (!title || !field) {
        return res.status(400).json({ success: false, message: 'Le titre et le domaine sont requis.' });
    }

    try {
        const model = getModel();
        const prompt = `En tant qu'expert en recrutement, rédige une description de stage professionnelle et attrayante pour le poste suivant :
    Titre : ${title}
    Domaine : ${field}
    Durée : ${duration} mois
    Compétences attendues : ${skills || 'Non spécifié'}
    
    La description doit inclure :
    1. Une introduction sur le rôle.
    2. Les missions principales.
    3. Le profil recherché.
    Rédige en français avec un ton professionnel.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ success: true, description: text });
    } catch (error) {
        console.error('Erreur Gemini:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la génération par l\'IA.' });
    }
};

// @desc    Optimiser une lettre de motivation
// @route   POST /api/ai/optimize-cover-letter
// @access  Private (Student)
exports.optimizeCoverLetter = async (req, res) => {
    const { coverLetter, internshipTitle } = req.body;

    if (!coverLetter) {
        return res.status(400).json({ success: false, message: 'La lettre de motivation est requise.' });
    }

    try {
        const model = getModel();
        const prompt = `Améliore cette lettre de motivation pour un stage de "${internshipTitle || 'Stage'}". 
    Rends-la plus persuasive, corrige le style et assure-toi qu'elle mette en avant la motivation.
    
    Lettre originale :
    "${coverLetter}"
    
    Réponse attendue : uniquement la nouvelle version optimisée de la lettre.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ success: true, optimizedLetter: text });
    } catch (error) {
        console.error('Erreur Gemini:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'optimisation par l\'IA.' });
    }
};

// @desc    Discuter avec l'Assistant Carrière
// @route   POST /api/ai/chat
// @access  Private (Student)
exports.chatWithAI = async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: 'Le message est requis.' });
    }

    try {
        const model = getModel();

        // Construire le contexte de la conversation
        let chatContext = `Tu es un expert en recrutement et coach carrière bienveillant. 
        Ton but est d'aider un étudiant à trouver un stage, améliorer son CV ou préparer un entretien.
        Sois concis, encourageant et professionnel.
        
        Historique de la conversation :
        ${history ? history.map(msg => `${msg.role === 'user' ? 'Étudiant' : 'Coach'}: ${msg.content}`).join('\n') : ''}
        
        Étudiant: ${message}
        Coach:`;

        const result = await model.generateContent(chatContext);
        const response = await result.response;
        const text = response.text();

        res.json({ success: true, reply: text });
    } catch (error) {
        console.error('Erreur Chat Gemini:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la communication avec l\'IA.' });
    }
};
