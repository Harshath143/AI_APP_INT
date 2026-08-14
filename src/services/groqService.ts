import { ChatMessage } from '../types/chat';
import { redactSensitiveData } from '../utils/sanitizer';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

/**
 * Validates the Groq API key by querying models endpoint
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey || !apiKey.trim().startsWith('gsk_')) {
    return false;
  }
  try {
    const response = await fetch(`${GROQ_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Streams chat completions from Groq API with live token callbacks.
 */
export async function streamGroqChat(
  messages: ChatMessage[],
  apiKey: string,
  model: string,
  systemPrompt: string,
  callbacks: StreamCallbacks,
): Promise<void> {
  if (!apiKey || !apiKey.trim()) {
    callbacks.onError(new Error('Missing Groq API Key. Please add your key in Settings.'));
    return;
  }

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const payload = {
    model: model || 'llama-3.1-8b-instant',
    messages: formattedMessages,
    temperature: 0.6,
    max_tokens: 2048,
    stream: true,
  };

  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Groq API Error (${response.status})`;
      try {
        const errJson = JSON.parse(errorText);
        if (errJson.error?.message) {
          errorMsg = errJson.error.message;
        }
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    // Process stream response
    const resBody = (response as any).body;
    if (resBody && typeof resBody.getReader === 'function') {
      const reader = resBody.getReader();
      const GlobalTextDecoder = (globalThis as any).TextDecoder;
      const decoder = GlobalTextDecoder ? new GlobalTextDecoder('utf-8') : null;
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const decodedChunk = decoder
          ? decoder.decode(value, { stream: true })
          : String.fromCharCode.apply(null, Array.from(value as Uint8Array));

        buffer += decodedChunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                accumulatedText += content;
                callbacks.onToken(content);
              }
            } catch {
              // ignore partial parse errors
            }
          }
        }
      }
      callbacks.onComplete(accumulatedText);
    } else {
      // Fallback for environments without body reader
      const fullTextResponse = await response.text();
      let fullAccumulated = '';

      const lines = fullTextResponse.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              fullAccumulated += content;
              callbacks.onToken(content);
            }
          } catch {}
        }
      }

      if (!fullAccumulated) {
        // Non-stream response fallback
        try {
          const jsonResp = JSON.parse(fullTextResponse);
          fullAccumulated = jsonResp.choices?.[0]?.message?.content || '';
          if (fullAccumulated) {
            callbacks.onToken(fullAccumulated);
          }
        } catch {}
      }

      callbacks.onComplete(fullAccumulated);
    }
  } catch (err: any) {
    const sanitizedError = redactSensitiveData(err) as Error;
    callbacks.onError(sanitizedError);
  }
}

/**
 * Transcribes audio file via Groq Whisper API (whisper-large-v3-turbo)
 */
export async function transcribeGroqAudio(
  audioUri: string,
  apiKey: string,
): Promise<string> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Missing Groq API Key for audio transcription.');
  }

  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/wav',
    name: 'interview_audio.wav',
  } as any);
  formData.append('model', 'whisper-large-v3-turbo');

  try {
    const response = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Whisper Transcription Error: ${errorText}`);
    }

    const data = await response.json();
    return data.text || '';
  } catch (err: any) {
    throw redactSensitiveData(err);
  }
}

/**
 * Analyzes image question / screenshot via Groq Vision API
 */
export async function analyzeGroqImage(
  base64Image: string,
  userPrompt: string,
  apiKey: string,
  visionModel: string = 'meta-llama/llama-4-scout-17b-16e-instruct',
  callbacks: StreamCallbacks,
): Promise<void> {
  if (!apiKey || !apiKey.trim()) {
    callbacks.onError(new Error('Missing Groq API Key for Vision analysis.'));
    return;
  }

  const payload = {
    model: visionModel || 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              userPrompt ||
              'Analyze this interview code/question image and provide a clear, correct solution with explanations and code.',
          },
          {
            type: 'image_url',
            image_url: {
              url: base64Image.startsWith('data:')
                ? base64Image
                : `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    temperature: 0.5,
    max_tokens: 2048,
    stream: false,
  };

  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Vision API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'No text extracted.';
    callbacks.onToken(answer);
    callbacks.onComplete(answer);
  } catch (err: any) {
    callbacks.onError(redactSensitiveData(err) as Error);
  }
}
