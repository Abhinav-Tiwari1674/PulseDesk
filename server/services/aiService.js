import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client lazily to avoid crashing if API key is not set immediately on boot
const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key is missing. Please add GEMINI_API_KEY="your_api_key" in your backend .env file.');
    }
    return new GoogleGenerativeAI(apiKey);
};

/**
 * Generate a detailed description and a checklist of subtasks based on a task title
 * @param {string} title 
 * @returns {Promise<{description: string, subTasks: string[]}>}
 */
export const generateTaskBreakdown = async (title) => {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({
        model: 'gemini-flash-latest',
        generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are a senior project manager. Based on this task title: "${title}", write a detailed task description and outline a checklist of 3-7 clear, actionable steps (sub-tasks) to complete it.
    Return your response strictly as a JSON object matching this schema:
    {
        "description": "string (detailed task description, 2-3 sentences)",
        "subTasks": ["string (sub-task title)", "string (sub-task title)", ...]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
};

/**
 * Generate a professional status report summarizing the updates chat history
 * @param {string} taskTitle 
 * @param {string} description 
 * @param {Array} updates 
 * @returns {Promise<string>}
 */
export const summarizeTaskProgress = async (taskTitle, description, updates = []) => {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-flash-latest' });

    const chatHistory = updates
        .map(u => `${u.sender?.name || 'User'} (${u.sender?.role || 'employee'}): ${u.message}`)
        .join('\n');

    const prompt = `You are an executive project director. Analyze this task and its status update chat history, then write a concise, professional progress summary (2-3 sentences max) outlining the current status, achievements, and blockers if any.
    
    Task Name: ${taskTitle}
    Task Description: ${description || 'No description provided.'}
    
    Updates history:
    ${chatHistory || 'No updates submitted yet.'}
    
    Response format: Only return the final summary text directly. No markdown formatting, prefix, or signature.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
};

/**
 * Enhance/rewrite a message to sound polite and professional for workplace chat
 * @param {string} rawMessage 
 * @returns {Promise<string>}
 */
export const enhanceMessageTone = async (rawMessage) => {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an expert corporate communications editor. Rewrite the following draft message into a polite, clear, and professional message suitable for a workplace chat:
    
    Draft: "${rawMessage}"
    
    Response format: Return ONLY the rewritten message. Do not wrap it in quotes, do not add introductory remarks (like "Here is your message:"), and do not add signatures.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
};
