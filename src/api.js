import { buildSystemPrompt } from './systemPrompt';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

export class ListingApiError extends Error {
  constructor(message, { rawText } = {}) {
    super(message);
    this.name = 'ListingApiError';
    this.rawText = rawText;
  }
}

function buildUserMessage(product) {
  return [
    `Product name: ${product.productName || '(not provided)'}`,
    `Current title: ${product.currentTitle || '(none - this is a new listing)'}`,
    `Product details (raw, may be unstructured - extract facts from it):\n${product.features || '(none provided)'}`,
    `Primary keyword: ${product.primaryKeyword || '(not provided)'}`,
    `Secondary keywords: ${product.secondaryKeywords || '(none)'}`,
    `Target customer: ${product.targetCustomer || '(not specified)'}`,
  ].join('\n\n');
}

function stripJsonFences(text) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

// Claude sometimes adds a preamble sentence before the JSON object despite
// being told not to. Extract the outermost {...} so that's tolerated.
function extractJsonObject(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return text;
  return text.slice(start, end + 1);
}

function parseListingResponse(rawText) {
  const cleaned = extractJsonObject(stripJsonFences(rawText));

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new ListingApiError(
      'Claude returned a response that could not be parsed as JSON.',
      { rawText },
    );
  }

  if (
    typeof parsed.title !== 'string' ||
    !Array.isArray(parsed.bullets) ||
    typeof parsed.description !== 'string'
  ) {
    throw new ListingApiError(
      "Claude's response was valid JSON but was missing the expected title, bullets, or description fields.",
      { rawText },
    );
  }

  return parsed;
}

function describeApiError(status, body) {
  const apiMessage = body?.error?.message;
  switch (status) {
    case 401:
      return 'Invalid API key. Check your Claude API key in API Settings.';
    case 403:
      return 'This API key does not have permission to make this request.';
    case 429:
      return 'Rate limit exceeded. Wait a moment and try again.';
    case 400:
      return `Claude rejected the request: ${apiMessage || 'please check your inputs.'}`;
    default:
      if (status >= 500) return 'The Claude API is temporarily unavailable. Try again shortly.';
      return apiMessage || `Request failed with status ${status}.`;
  }
}

// Calls the Claude messages API and returns a parsed { title, bullets, description }.
// Throws ListingApiError with a friendly message (and rawText, if available) on failure.
export async function generateListing({ apiKey, accountSettings, product }) {
  if (!apiKey?.trim()) {
    throw new ListingApiError('Add your Claude API key in API Settings before generating.');
  }

  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        system: buildSystemPrompt(accountSettings),
        messages: [{ role: 'user', content: buildUserMessage(product) }],
      }),
    });
  } catch {
    throw new ListingApiError('Could not reach the Claude API. Check your connection and try again.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ListingApiError(describeApiError(response.status, body));
  }

  const data = await response.json();
  const rawText = data?.content?.find((block) => block.type === 'text')?.text ?? '';
  return parseListingResponse(rawText);
}
