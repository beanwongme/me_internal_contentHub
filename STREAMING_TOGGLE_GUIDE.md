# Streaming Mode Toggle

## Overview

I've added an option to toggle streaming mode on/off. This can help avoid 429 (rate limit) errors.

## What's New

### 1. Environment Variable (app/.env)
```env
VITE_USE_STREAMING=true
```
- Set to `true` for real-time streaming (faster UX, may cause 429 errors)
- Set to `false` for non-streaming mode (slower but more reliable)

### 2. UI Toggle
Two checkboxes now appear below the Generate button:

- ☑️ **Use Mock Mode** - Generate fake content instantly
- ☑️ **Use Streaming Mode** - Real-time word-by-word generation

### 3. Browser Storage
You can also toggle via browser console:
```javascript
// Disable streaming (use non-streaming mode)
localStorage.setItem('use_streaming', 'false');
location.reload();

// Enable streaming (default)
localStorage.setItem('use_streaming', 'true');
location.reload();
```

## How It Works

### Streaming Mode (ON)
- Content appears word-by-word in real-time
- Shows token count, speed (tok/s)
- Shows estimated time remaining
- Uses more API resources
- May trigger 429 rate limits

### Non-Streaming Mode (OFF)
- Content appears all at once when complete
- No real-time progress indicators
- Simpler request/response
- Less likely to hit rate limits
- Slightly slower perceived speed

## When to Use Each Mode

### Use Streaming (default) when:
- You want to see content being generated live
- You want token usage stats
- You're generating single channels
- You're not hitting rate limits

### Turn OFF Streaming when:
- You're getting 429 errors frequently
- You're generating multiple channels at once
- You prefer reliability over real-time feedback
- API quota is limited

## Testing

1. **Hard refresh browser** (Ctrl+Shift+R)
2. **Look for the checkboxes** below "Generate Content" button
3. **Try both modes:**
   - With streaming ON: See real-time generation
   - With streaming OFF: Content appears when complete

## Troubleshooting

### Still getting 429 errors?
1. **Uncheck "Use Streaming Mode"**
2. **Wait 1 minute between requests**
3. **Generate fewer channels at once**
4. **Enable Mock Mode** for testing

### Content not appearing?
Check browser console (F12) for:
- `[Generate] Streaming: true/false` - confirms mode
- `[Stream]` or `[NonStream]` logs - shows which handler is used
- Any error messages

## Summary

| Mode | Speed | Real-time | Rate Limit Risk | Best For |
|------|-------|-----------|-----------------|----------|
| Streaming ON | Fast UX | Yes | Higher | Single channels, good quota |
| Streaming OFF | Slower UX | No | Lower | Multiple channels, limited quota |
| Mock Mode | Instant | N/A | None | UI testing |

**Proxy server is running with both modes supported!**
