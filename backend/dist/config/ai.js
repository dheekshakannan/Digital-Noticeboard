"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartSearchNotices = exports.generateSummary = void 0;
const genai_1 = require("@google/genai");
/**
 * Instantiates the Google Gen AI client if the API key is present in environment variables.
 */
const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return null;
    }
    return new genai_1.GoogleGenAI({ apiKey });
};
/**
 * Generates an executive 2-3 bullet point summary of notice content using Gemini.
 * Falls back to an algorithmic text extractor if the API key is absent or fails.
 */
const generateSummary = async (title, content) => {
    const ai = getAiClient();
    if (!ai) {
        console.warn('Gemini API key is not configured. Falling back to local summarizer.');
        return generateFallbackSummary(content);
    }
    try {
        const prompt = `You are an AI assistant for a college digital noticeboard. 
Summarize the following notice in exactly 2 or 3 concise bullet points. 
Focus only on crucial details (dates, venues, deadlines, eligibility, target audience, and action items). 
Make the bullets clean, brief, and highly readable for busy students.

Title: ${title}
Content: ${content}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text?.trim() || generateFallbackSummary(content);
    }
    catch (error) {
        console.error('Gemini API summarizer error:', error);
        return generateFallbackSummary(content);
    }
};
exports.generateSummary = generateSummary;
/**
 * Semantic Smart Search: Evaluates notice relevance against student's search query using Gemini.
 * Falls back to keyword scoring if the API key is absent or fails.
 */
const smartSearchNotices = async (query, notices) => {
    if (notices.length === 0)
        return [];
    const ai = getAiClient();
    if (!ai) {
        console.warn('Gemini API key is not configured. Falling back to local keyword scoring search.');
        return fallbackSearch(query, notices);
    }
    try {
        // Keep payload lightweight by mapping only essential properties
        const noticesPayload = notices.map((notice, idx) => ({
            index: idx,
            id: notice._id.toString(),
            title: notice.title,
            category: notice.category,
            snippet: notice.aiSummary || notice.content.substring(0, 150)
        }));
        const prompt = `You are a smart semantic search engine for a university digital noticeboard.
A student is typing this search query: "${query}"

Here is the list of active notices:
${JSON.stringify(noticesPayload, null, 2)}

Identify which notices are relevant to the student's search query (meaning they match the intent or topic, even if they use different keywords). Rank them by relevance.
Return ONLY a raw JSON array of notice indices (from the input notice list) in order of relevance. For example: [2, 0] or [] if none match. Do NOT wrap the output in markdown codeblocks (like \`\`\`json) or add any explanation text. Just return the raw bracketed array.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        const textResult = response.text?.trim() || '[]';
        // Remove potential markdown code blocks
        const cleanJson = textResult
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
        const matchedIndices = JSON.parse(cleanJson);
        const results = [];
        for (const idx of matchedIndices) {
            if (idx >= 0 && idx < notices.length) {
                results.push(notices[idx]);
            }
        }
        return results;
    }
    catch (error) {
        console.error('Gemini API smart search error:', error);
        return fallbackSearch(query, notices);
    }
};
exports.smartSearchNotices = smartSearchNotices;
/**
 * Algorithmic fallback summarizer that splits text into sentences and formats the first three.
 */
const generateFallbackSummary = (content) => {
    // Strip simple HTML tag structures if present
    const plainText = content.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim();
    // Split into sentences
    const sentences = plainText
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 5);
    if (sentences.length === 0) {
        return '• No text details could be summarized.';
    }
    const limit = Math.min(3, sentences.length);
    let summary = '';
    for (let i = 0; i < limit; i++) {
        // Add dot if not present
        const sentence = sentences[i];
        const dot = sentence.endsWith('.') || sentence.endsWith('!') || sentence.endsWith('?') ? '' : '.';
        summary += `• ${sentence}${dot}\n`;
    }
    return summary.trim();
};
/**
 * Local keyword relevance scoring fallback search
 */
const fallbackSearch = (query, notices) => {
    const keywords = query
        .toLowerCase()
        .split(/[\s,.-]+/)
        .filter(w => w.length > 2);
    if (keywords.length === 0)
        return notices;
    return notices
        .map(notice => {
        let score = 0;
        const title = notice.title.toLowerCase();
        const content = notice.content.toLowerCase();
        const category = notice.category.toLowerCase();
        for (const word of keywords) {
            if (title.includes(word))
                score += 10;
            if (category.includes(word))
                score += 5;
            if (content.includes(word))
                score += 2;
        }
        return { notice, score };
    })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.notice);
};
