# DeepSeek Endpoint Configuration Fix

## Issue

The `/api/ai/deepseek/chat` endpoint was returning **500 Internal Server Error** for every request in local development because `DEEPSEEK_API_KEY` was not configured in `.env`.

### Root Cause

```typescript
// Old behavior - line 37
const client = getClient() // Throws error if API key missing
// Caught by try-catch → returns 500 error
```

The `getClient()` function threw an exception when the API key was missing, which was caught by the generic error handler and returned a 500 status code with the message "Failed to contact DeepSeek".

## Solution

Added an **early configuration check** at the start of the POST handler to return **503 Service Unavailable** when the API key is not configured:

```typescript
// New behavior - line 82-92
if (!process.env.DEEPSEEK_API_KEY) {
  return NextResponse.json(
    {
      error: 'DeepSeek AI service not configured',
      detail: 'DEEPSEEK_API_KEY environment variable is not set. AI-powered responses are unavailable.',
      suggestion: 'The concierge widget will continue to work with deterministic intent detection.',
    },
    { status: 503 }
  )
}
```

## Why 503 Instead of 500?

| Status Code | Meaning | When to Use |
|-------------|---------|-------------|
| **500** | Internal Server Error | Unexpected server-side bugs or crashes |
| **503** | Service Unavailable | Service is intentionally disabled or not configured |

**Benefits:**
- ✅ **Clarity**: Callers immediately know this is a configuration issue, not a bug
- ✅ **Monitoring**: 500s trigger alerts; 503s indicate expected unavailability
- ✅ **Debugging**: No need to dig through stack traces for missing env vars
- ✅ **Documentation**: Response body explicitly explains the issue and workaround

## Impact

### Before Fix
```bash
# Request to DeepSeek endpoint
POST /api/ai/deepseek/chat
→ 500 Internal Server Error
→ { error: "Failed to contact DeepSeek", detail: "DeepSeek API key not configured" }
```

**Dev server logs:**
```
POST /api/ai/deepseek/chat 500 in 23ms
Error: DeepSeek API key not configured
```

### After Fix
```bash
# Request to DeepSeek endpoint (no API key)
POST /api/ai/deepseek/chat
→ 503 Service Unavailable
→ {
  error: "DeepSeek AI service not configured",
  detail: "DEEPSEEK_API_KEY environment variable is not set. AI-powered responses are unavailable.",
  suggestion: "The concierge widget will continue to work with deterministic intent detection."
}
```

**Dev server logs:**
```
POST /api/ai/deepseek/chat 503 in 2ms
```

## Context

- **Phase 1/2**: Concierge widget uses **deterministic intent detection** (keyword-based)
- **Phase 4**: DeepSeek AI integration planned for advanced NLP (optional enhancement)
- **Current**: AI endpoint exists but is not critical path for widget functionality

The fix ensures that:
1. ✅ Widget continues to work without AI configured
2. ✅ Logs are cleaner (no 500 errors)
3. ✅ Developers understand the service is optional
4. ✅ Production deployment doesn't require DEEPSEEK_API_KEY unless AI features are enabled

## Files Modified

- `src/app/api/ai/deepseek/chat/route.ts` - Added early configuration check

## Verification

```bash
# Build succeeds
$ npm run build
✓ Compiled successfully

# No linter errors
$ npm run lint
✓ No issues found

# Test endpoint without API key
$ curl -X POST http://localhost:3000/api/ai/deepseek/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'
→ 503 Service Unavailable (expected) ✅
```

## Future Configuration (Optional)

To enable AI-powered responses in local development:

```bash
# Add to .env.local
DEEPSEEK_API_KEY=sk-your-actual-deepseek-key-here
```

Then restart the dev server. The endpoint will return 200 with AI-generated responses.

---

**Status**: ✅ Fixed  
**Error Rate**: 500s eliminated from dev logs  
**Breaking Changes**: None (behavior improved, API contract unchanged)

