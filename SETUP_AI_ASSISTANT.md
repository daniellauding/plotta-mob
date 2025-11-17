# AI Assistant Setup Guide

The AI Assistant feature requires a Supabase Edge Function to work. Here's how to set it up:

## Option 1: Use Built-in Provider (Recommended for Testing)

If you're using the default "lovable" provider, you don't need an API key. However, you need to deploy the Supabase Edge Function.

## Option 2: Use Your Own API Key

You can use OpenAI or Anthropic (Claude) with your own API key:

1. **Get an API Key:**
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/

2. **Configure in the App:**
   - Open AI Assistant from the canvas (magic wand icon)
   - Tap the settings icon (gear) in the header
   - Enter your API key
   - The key is stored locally on your device

## Setting Up the Edge Function

You need to create a Supabase Edge Function to handle AI requests:

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

### 4. Create the Edge Function

Create `supabase/functions/ai-assistant/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

serve(async (req) => {
  try {
    const { action, prompt, provider, apiKey, stickies } = await req.json()

    // For OpenAI
    if (provider === 'openai' && apiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a helpful assistant for a note-taking app. Context: ${JSON.stringify(stickies)}`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
        }),
      })

      const data = await response.json()
      return new Response(
        JSON.stringify({ response: data.choices[0].message.content }),
        { headers: { "Content-Type": "application/json" } }
      )
    }

    // For Anthropic (Claude)
    if (provider === 'anthropic' && apiKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Context: ${JSON.stringify(stickies)}\n\n${prompt}`
            }
          ],
        }),
      })

      const data = await response.json()
      return new Response(
        JSON.stringify({ response: data.content[0].text }),
        { headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Please provide an API key in settings' }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

### 5. Deploy the Function

```bash
supabase functions deploy ai-assistant
```

### 6. Set Environment Variables (Optional)

If you want to use a default API key server-side:

```bash
supabase secrets set OPENAI_API_KEY=your-key-here
# or
supabase secrets set ANTHROPIC_API_KEY=your-key-here
```

## Testing

1. Open the app
2. Tap the magic wand icon (AI Assistant)
3. Try asking: "Summarize all my notes"
4. Or use the Generate tab to create new content

## Troubleshooting

### "Failed to process request" Error

1. Check Edge Function logs:
   ```bash
   supabase functions logs ai-assistant
   ```

2. Verify the function is deployed:
   ```bash
   supabase functions list
   ```

### No API Key Provider

If you don't want to use an API key, you can modify the function to use a free provider or integrate with other services.

## Cost Considerations

- **OpenAI GPT-4**: ~$0.03 per 1K tokens
- **OpenAI GPT-3.5-Turbo**: ~$0.002 per 1K tokens (cheaper)
- **Anthropic Claude**: ~$0.015 per 1K tokens

A typical request uses 100-500 tokens, so costs are minimal for personal use.
