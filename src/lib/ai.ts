const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export async function askGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function verifyMCQ(question: string, options: { label: string; text: string }[], bookAnswer: string): Promise<{
  aiAnswer: string;
  explanation: string;
  agrees: boolean;
}> {
  const optionsText = options.map(o => `${o.label}) ${o.text}`).join('\n');
  const prompt = `You are a Python programming expert. Analyze this MCQ and determine the correct answer.

Question: ${question}

Options:
${optionsText}

The practice book says the answer is: ${bookAnswer}

Respond in this EXACT format (no markdown, no extra text):
ANSWER: <letter>
AGREES: <true/false>
EXPLANATION: <brief explanation in 1-2 sentences>`;

  const response = await askGemini(prompt);
  
  const answerMatch = response.match(/ANSWER:\s*([A-D])/i);
  const agreesMatch = response.match(/AGREES:\s*(true|false)/i);
  const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]+)/i);

  return {
    aiAnswer: answerMatch?.[1]?.toUpperCase() || bookAnswer,
    agrees: agreesMatch?.[1]?.toLowerCase() === 'true',
    explanation: explanationMatch?.[1]?.trim() || response.trim(),
  };
}

export async function reviewCode(question: string, code: string, output: string): Promise<{
  score: number;
  feedback: string;
  improvements: string[];
  sampleSolution: string;
}> {
  const prompt = `You are a Python programming expert and teacher. Review this student's code for a practice exam.

Question: ${question}

Student's Code:
\`\`\`python
${code}
\`\`\`

Student's Output:
${output || '(no output)'}

Respond in this EXACT format (no markdown outside code blocks):
SCORE: <number 0-100>
FEEDBACK: <2-3 sentences about the code quality and correctness>
IMPROVEMENTS:
- <improvement 1>
- <improvement 2>
- <improvement 3>
SOLUTION:
\`\`\`python
<your sample solution code>
\`\`\``;

  const response = await askGemini(prompt);

  const scoreMatch = response.match(/SCORE:\s*(\d+)/);
  const feedbackMatch = response.match(/FEEDBACK:\s*([\s\S]+?)(?=IMPROVEMENTS:)/i);
  const improvementsMatch = response.match(/IMPROVEMENTS:\s*([\s\S]+?)(?=SOLUTION:)/i);
  const solutionMatch = response.match(/```python\s*([\s\S]+?)```/);

  const improvements = improvementsMatch?.[1]
    ?.split('\n')
    .map(l => l.replace(/^[-•*]\s*/, '').trim())
    .filter(l => l.length > 0) || [];

  return {
    score: parseInt(scoreMatch?.[1] || '50'),
    feedback: feedbackMatch?.[1]?.trim() || 'Code reviewed.',
    improvements,
    sampleSolution: solutionMatch?.[1]?.trim() || '',
  };
}

export async function generateSolution(question: string): Promise<string> {
  const prompt = `You are a Python programming expert. Write a clean, well-commented solution for this exam question.

Question: ${question}

Write ONLY the Python code solution. Include comments explaining key steps. Do not include any explanation outside the code.`;

  return await askGemini(prompt);
}
