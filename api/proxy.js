export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const userPayload = request.body;
  if (!userPayload) {
    return response.status(400).json({ message: 'Bad Request: No payload received.' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return response.status(500).json({ message: 'Server configuration error: API key not set.' });
  }

  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload),
    });

    const text = await geminiResponse.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!geminiResponse.ok) {
      return response.status(geminiResponse.status).json(typeof data === "object" ? data : { message: data });
    }
    response.status(200).json(data);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    response.status(500).json({ message: 'An internal server error occurred.' });
  }
}