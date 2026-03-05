// ============================================
// CONTROLLER GÉNÉRATION D'IMAGES
// ============================================

const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const generateImage = async (req, res) => {
  try {
    const { prompt, size = '1024x1024', quality = 'standard' } = req.body;

    console.log('🎨 Génération d\'image pour:', prompt.substring(0, 50) + '...');

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Le prompt est requis'
      });
    }

    // Optimisation du prompt pour DALL-E
    const enhancedPrompt = await enhancePromptForImage(prompt);

    // Appel à DALL-E 3
    const response = await openai.createImage({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: size,
      quality: quality,
      response_format: "url"
    });

    const imageUrl = response.data.data[0].url;
    const revisedPrompt = response.data.data[0].revised_prompt;

    res.json({
      success: true,
      imageUrl,
      revisedPrompt,
      prompt: enhancedPrompt,
      size,
      quality
    });

  } catch (error) {
    console.error('❌ Erreur génération image:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: 'Erreur DALL-E',
        details: error.response.data.error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération'
      });
    }
  }
};

// ============================================
// FONCTION D'OPTIMISATION DES PROMPTS IMAGE
// ============================================

const enhancePromptForImage = async (originalPrompt) => {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `Tu es un expert en génération d'images avec DALL-E. 
          Transforme les prompts utilisateur en descriptions détaillées et visuelles.
          Inclus: style artistique, composition, couleurs, éclairage, ambiance.
          Reste fidèle à l'idée originale mais enrichis-la pour un meilleur résultat.` 
        },
        { 
          role: "user", 
          content: `Optimise ce prompt pour DALL-E 3: "${originalPrompt}"` 
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return completion.data.choices[0].message.content;
  } catch (error) {
    console.log('Utilisation du prompt original');
    return originalPrompt;
  }
};

module.exports = { generateImage };
