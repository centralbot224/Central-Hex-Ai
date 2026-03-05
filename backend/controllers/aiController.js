// ============================================
// CONTROLLER IA PRINCIPAL
// ============================================

const { Configuration, OpenAIApi } = require('openai');
const systemPrompt = require('../utils/systemPrompt');
const Conversation = require('../models/Conversation');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// ============================================
// FONCTION PRINCIPALE DE CHAT
// ============================================

const getAIResponse = async (req, res) => {
  try {
    const { message, conversationHistory = [], userId } = req.body;

    console.log('📨 Message reçu:', message.substring(0, 50) + '...');

    // Construction de l'historique des messages
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10), // Garde les 10 derniers messages pour le contexte
      { role: "user", content: message }
    ];

    // Appel à l'API OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
      top_p: 0.9
    });

    const aiResponse = completion.data.choices[0].message.content;
    
    // Vérifier si l'utilisateur demande une image
    const imageKeywords = [
      'génère une image', 'crée une image', 'dessine', 'illustre',
      'generate image', 'create image', 'draw', 'picture of',
      'montre-moi', 'show me', 'image de', 'photo de'
    ];
    
    const shouldGenerateImage = imageKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    // Sauvegarder la conversation si userId est fourni
    if (userId) {
      await Conversation.findOneAndUpdate(
        { userId },
        {
          $push: {
            messages: {
              $each: [
                { role: 'user', content: message, timestamp: new Date() },
                { role: 'assistant', content: aiResponse, timestamp: new Date() }
              ]
            }
          },
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    }

    // Analyser si l'utilisateur demande le livre
    const bookKeywords = ['livre', 'book', '51 prompts', 'télécharger', 'download', 'ressource'];
    const mentionBook = bookKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    // Réponse enrichie
    const enhancedResponse = mentionBook && !aiResponse.includes('mediafire') 
      ? aiResponse + '\n\n📘 **Télécharge notre livre ici :**\n🔗 https://www.mediafire.com/file/umkdwbmhvpxqaym/51_Prompts_G%25C3%25A9niaux_pour_Tirer_le_Meilleur_de_ChatGPT_Onur_Karapi.pdf/file'
      : aiResponse;

    res.json({
      success: true,
      response: enhancedResponse,
      shouldGenerateImage,
      imagePrompt: shouldGenerateImage ? message : null,
      timestamp: new Date(),
      tokens: completion.data.usage.total_tokens
    });

  } catch (error) {
    console.error('❌ Erreur IA détaillée:', error);
    
    // Gestion spécifique des erreurs OpenAI
    if (error.response) {
      console.error('OpenAI Error:', error.response.data);
      res.status(error.response.status).json({
        success: false,
        error: 'Erreur du service IA',
        details: error.response.data.error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Une erreur est survenue',
        message: error.message
      });
    }
  }
};

// ============================================
// GÉNÉRATION DE PROMPTS OPTIMISÉS
// ============================================

const generateOptimizedPrompt = async (req, res) => {
  try {
    const { userRequest, promptType } = req.body;

    const promptTemplates = {
      'marketing': 'Génère un prompt marketing optimisé pour',
      'creative': 'Crée un prompt créatif détaillé pour',
      'technical': 'Formule une requête technique précise pour',
      'educational': 'Développe un prompt pédagogique pour'
    };

    const template = promptTemplates[promptType] || 'Optimise ce prompt pour';

    const optimizationPrompt = `
    En tant qu'expert en ingénierie de prompts, transforme cette demande en un prompt optimisé :
    
    Demande originale : "${userRequest}"
    
    Le prompt optimisé doit :
    - Être structuré et clair
    - Inclure le contexte nécessaire
    - Définir le rôle de l'IA
    - Spécifier le format de sortie attendu
    - Anticiper les besoins de l'utilisateur
    
    Retourne uniquement le prompt optimisé, sans commentaires supplémentaires.
    `;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Tu es un expert en optimisation de prompts pour IA." },
        { role: "user", content: optimizationPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const optimizedPrompt = completion.data.choices[0].message.content;

    res.json({
      success: true,
      original: userRequest,
      optimized: optimizedPrompt,
      type: promptType
    });

  } catch (error) {
    console.error('❌ Erreur optimisation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'optimisation'
    });
  }
};

module.exports = { getAIResponse, generateOptimizedPrompt };
