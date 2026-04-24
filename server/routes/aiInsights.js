const { GoogleGenAI } = require('@google/genai');
const { addHistoryEntry } = require('./history');

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || '');

function buildPrompt(data) {
  return `You are a business analytics assistant. Analyze the following marketing data and provide exactly 4 key insights in simple, actionable business language.

Rules:
- Each insight must be a standalone sentence or two.
- Focus on what the numbers mean for the business, not just what they are.
- Suggest at least one concrete action (e.g., "Shift budget to Source X").
- Return ONLY a valid JSON array of strings. Example: ["Insight 1", "Insight 2", "Insight 3", "Insight 4"]
- No markdown, no filler.

Data:
${JSON.stringify(data, null, 2)}`;
}

function parseAIResponse(content) {
  try {
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('AI response did not contain a valid JSON array');
    return JSON.parse(match[0]);
  } catch (e) {
    console.error('[AI Parse Error] Failed to parse JSON from:', content);
    return ['Unable to parse AI insights. Please check the data format.'];
  }
}

async function aiInsightsRoute(req, res) {
  const { totalLeads, totalRevenue, avgConversion, topSource, trend, insights, userId } = req.body;

  if (totalLeads === undefined || totalRevenue === undefined) {
    return res.status(400).json({ error: 'Missing required analytics fields in request body' });
  }

  const analyticsData = { totalLeads, totalRevenue, avgConversion, topSource, trend, insights };

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = buildPrompt(analyticsData);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawContent = response.text();

    const aiInsights = parseAIResponse(rawContent);

    // Save to in-memory history if userId provided
    if (userId) {
      addHistoryEntry(userId, {
        totalLeads,
        totalRevenue,
        topSource: topSource || 'Unknown',
        insights: aiInsights,
      });
    }

    return res.status(200).json({ insights: aiInsights });

  } catch (error) {
    console.error('[AI Insights Error]', error?.message ?? error);

    const isMissingKey = !process.env.GEMINI_API_KEY;
    const fallbackMessage = isMissingKey
      ? 'Gemini API key is missing. Please set GEMINI_API_KEY in server/.env'
      : 'AI service is currently unavailable. Please try again later.';

    return res.status(200).json({
      insights: [fallbackMessage],
      fallback: true,
    });
  }
}

module.exports = { aiInsightsRoute };
