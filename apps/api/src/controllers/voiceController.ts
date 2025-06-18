import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handleVoiceCommand = async (req: Request, res: Response) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'No se proporcionó ningún comando.' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: `Eres un asistente administrativo. Responde a esta solicitud: ${command}` }],
      max_tokens: 150,
    });

    const botResponse = response.choices[0]?.message?.content?.trim() || 'No tengo una respuesta para eso.';
    res.json({ response: botResponse });
  } catch (error) {
    console.error('Error al procesar el comando de voz:', error);
    res.status(500).json({ error: 'Error al procesar el comando de voz.' });
  }
};
