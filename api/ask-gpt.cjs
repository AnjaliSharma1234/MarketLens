const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, temperature = 0.7, model = 'gpt-4-turbo-preview' } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages array' });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not set' });
  }

  try {
    console.log('Making OpenAI API request:', {
      model,
      messages,
      temperature
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return res.status(response.status).json({ error: error.error?.message || 'OpenAI API request failed' });
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Return the content in the format expected by the frontend
    return res.status(200).json({ 
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    });
  } catch (err) {
    console.error('Error calling OpenAI:', err);
    return res.status(500).json({ error: 'Failed to contact OpenAI' });
  }
}; 