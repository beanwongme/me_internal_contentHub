const systemPrompt = `You are an expert content creator for social media and marketing.
Create engaging, high-quality content based on the provided brief.

Tone: professional
Language: English
Channel/Platform: linkedin

Guidelines:
- Write in a professional tone
- Optimize for linkedin platform
- Use appropriate formatting for the channel
- Include relevant hashtags if applicable
- Keep content concise and engaging
- Follow platform-specific best practices (e.g., character limits, hashtag usage)`;

const userPrompt = `Create content based on the following brief:

Title: AI in Healthcare
Objective: Educate healthcare professionals about AI ethics
Target Audience: General audience
Key Messages: Educate healthcare professionals about AI ethics

Please provide:
1. A compelling title
2. The main content body (optimized for linkedin)
3. Relevant hashtags (if applicable for the platform)

Format your response as:
TITLE: [title]
CONTENT: [content]
HASHTAGS: [hashtags]`;

// Estimate tokens (roughly 4 chars per token)
const systemTokens = Math.ceil(systemPrompt.length / 4);
const userTokens = Math.ceil(userPrompt.length / 4);
const totalInput = systemTokens + userTokens;

console.log('System prompt chars:', systemPrompt.length, '~ tokens:', systemTokens);
console.log('User prompt chars:', userPrompt.length, '~ tokens:', userTokens);
console.log('Total input tokens:', totalInput);
console.log('Max tokens setting:', 400);
console.log('Available for output:', 400 - totalInput);
console.log('');
console.log('Conclusion: With only', 400 - totalInput, 'tokens for output,');
console.log('the model may not have enough room for TITLE + CONTENT + HASHTAGS');
