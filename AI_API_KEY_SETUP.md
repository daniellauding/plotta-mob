# AI API Key Setup - No More Entering Keys!

## Quick Setup (2 Options)

### Option 1: Add to .env File (Recommended)

**1. Open `.env` file**

**2. Add your API key:**

```env
# Choose one:
EXPO_PUBLIC_OPENAI_API_KEY=sk-...your-openai-key...
# OR
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...your-anthropic-key...

# Set your preferred provider
EXPO_PUBLIC_DEFAULT_AI_PROVIDER=openai
```

**3. Restart the app** (kill and reopen)

**4. Done!** The app will automatically use your key from .env

### Option 2: Save in the App

**1. Open AI Assistant** (magic wand icon)

**2. Tap Settings** (gear icon)

**3. Select Provider** (OpenAI or Anthropic)

**4. Enter API Key**

**5. Tap "Save API Key"**

**6. Done!** The key is saved permanently on your device

## Get Your API Key

### OpenAI (GPT-4 / GPT-3.5)
1. Visit: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Add to `.env` or save in app

**Costs:**
- GPT-4: ~$0.03 per 1K tokens (~$0.01 per question)
- GPT-3.5-Turbo: ~$0.002 per 1K tokens (much cheaper!)

### Anthropic (Claude)
1. Visit: https://console.anthropic.com/
2. Go to "API Keys"
3. Create new key
4. Copy the key (starts with `sk-ant-`)
5. Add to `.env` or save in app

**Costs:**
- Claude 3 Sonnet: ~$0.015 per 1K tokens

## How It Works

The app checks keys in this order:

1. **User-saved key** (from app settings) → Highest priority
2. **Environment variable** (from .env file) → Second priority
3. **No key** → You'll need to add one

## Features Using AI

- **Semantic Search**: Search notes by meaning
- **Insights**: Get summaries and patterns
- **Generate**: Create new notes from existing content

## Privacy & Security

- ✅ Keys stored locally (AsyncStorage)
- ✅ Keys never sent to our servers
- ✅ Direct API calls to OpenAI/Anthropic
- ✅ Your notes stay private

## Updating Your Key

### Change .env Key:
1. Edit `.env` file
2. Restart app

### Change Saved Key:
1. AI Assistant → Settings
2. Enter new key
3. Tap "Save API Key"

## Removing Your Key

### From App:
1. AI Assistant → Settings
2. Clear the text field
3. Tap "Save API Key"

### From .env:
1. Remove or comment out the line:
   ```env
   # EXPO_PUBLIC_OPENAI_API_KEY=
   ```
2. Restart app

## Troubleshooting

### "Please provide an API key"

**Solution:** You haven't set up a key yet. Follow Option 1 or 2 above.

### "Invalid API key"

**Solutions:**
1. Check the key is correct (no extra spaces)
2. Make sure it starts with `sk-` (OpenAI) or `sk-ant-` (Anthropic)
3. Verify the key is active in your provider dashboard

### Key saved but not working

**Solution:** Make sure you selected the right provider:
- OpenAI key → Select "OpenAI"
- Anthropic key → Select "Anthropic"

### Changes not taking effect

**Solution:** Restart the app completely (kill and reopen)

## Example .env File

```env
# Supabase (already configured)
EXPO_PUBLIC_SUPABASE_URL=https://...supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# AI Assistant (add your key here)
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-abc123...
EXPO_PUBLIC_DEFAULT_AI_PROVIDER=openai
```

## Testing

1. Open AI Assistant
2. Try: "Summarize my notes"
3. Should work immediately! ✅

---

## What We Changed

1. ✅ Added `.env` support for API keys
2. ✅ Added persistent storage (AsyncStorage)
3. ✅ Added provider selection (OpenAI/Anthropic)
4. ✅ Added save button in settings
5. ✅ Auto-load keys on app start

Now you only need to enter your key **once**! 🎉
