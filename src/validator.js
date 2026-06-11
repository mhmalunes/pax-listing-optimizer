// Pure JS compliance validator for generated listing copy.
// Runs entirely client-side after every generation. Each check returns
// zero or more { field, severity, rule, match, category } entries for
// display in the ValidationPanel. severity is either 'ERROR' or 'WARN'.

// Ordered list of check categories shown in the ValidationPanel. A category
// is rendered as "pass" when no issue in `issues` carries its id.
export const CHECK_CATEGORIES = [
  { id: 'title-length', label: 'Title length' },
  { id: 'title-characters', label: 'Title special characters' },
  { id: 'brand-frequency', label: 'Brand name frequency' },
  { id: 'keyword-stuffing', label: 'Keyword stuffing (title)' },
  { id: 'medical-claims', label: 'Medical claims' },
  { id: 'pricing-claims', label: 'Pricing & shipping claims' },
  { id: 'superlatives', label: 'Superlatives' },
  { id: 'competitor-names', label: 'Competitor names' },
  { id: 'bullet-count', label: 'Bullet count' },
  { id: 'bullet-length', label: 'Bullet length' },
  { id: 'bullet-formatting', label: 'Bullet formatting' },
  { id: 'description-length', label: 'Description length' },
];

const SPECIAL_CHARS_REGEX = /[!$?_{}^¬¦]/;

const EMOJI_REGEX =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/u;

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'so', 'yet', 'of', 'in',
  'on', 'to', 'at', 'by', 'with', 'from', 'as', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'it', 'its', 'this', 'that', 'these', 'those',
  'your', 'you', 'our', 'we', 'their', 'them', 'his', 'her', 'he', 'she',
  'than', 'then', 'too', 'very', 'can', 'will', 'just', 'not', 'no', 'do',
  'does', 'did', 'if', 'into', 'about', 'over', 'under', 'more', 'most',
  'each', 'any', 'all', 'some', 'up', 'down', 'out', 'off', 'per', 'via',
  'for',
]);

// Common auto-body tool / detailing brands. Account Settings "Additional
// Rules" can extend this list with a line like: "Competitors: Brand A, Brand B"
const DEFAULT_COMPETITORS = [
  '3M',
  'Eastwood',
  'Dynabrade',
  'Dent Fix',
  'Astro Pneumatic',
  'Sunex',
  'Mirka',
  'Norton',
  "Meguiar's",
  'Chemical Guys',
  'Griot\'s Garage',
  'Rupes',
  'Snap-on',
  'Matco',
  'Mac Tools',
];

const MEDICAL_PATTERNS = [
  { rule: 'Medical claim ("treats")', regex: /\btreats?\b/i },
  { rule: 'Medical claim ("cures")', regex: /\bcures?\b/i },
  { rule: 'Medical claim ("prevents")', regex: /\bprevents?\b/i },
  { rule: 'Medical claim ("heals")', regex: /\bheals?\b/i },
  { rule: 'Medical claim ("doctor recommended")', regex: /\bdoctor recommended\b/i },
  { rule: 'Medical claim ("FDA approved")', regex: /\bfda approved\b/i },
  { rule: 'Medical claim ("therapeutic")', regex: /\btherapeutic\b/i },
  { rule: 'Medical claim ("antibacterial")', regex: /\bantibacterial\b/i },
];

const PRICING_PATTERNS = [
  { rule: 'Pricing/shipping claim ("cheapest")', regex: /\bcheapest\b/i },
  { rule: 'Pricing/shipping claim ("free shipping")', regex: /\bfree shipping\b/i },
  { rule: 'Pricing/shipping claim ("lowest price")', regex: /\blowest price\b/i },
  { rule: 'Pricing/shipping claim ("best deal")', regex: /\bbest deal\b/i },
  { rule: 'Pricing/shipping claim ("discount")', regex: /\bdiscounts?\b/i },
  { rule: 'Pricing/shipping claim ("on sale")', regex: /\bon sale\b/i },
  { rule: 'Pricing/shipping claim ("save money")', regex: /\bsave money\b/i },
];

const SUPERLATIVE_PATTERNS = [
  { rule: 'Superlative ("#1")', regex: /#1\b/ },
  { rule: 'Superlative ("number one")', regex: /\bnumber one\b/i },
  { rule: 'Superlative ("best in the world")', regex: /\bbest in the world\b/i },
  { rule: "Superlative (\"world's best\")", regex: /\bworld['’]s best\b/i },
  { rule: 'Superlative ("top rated")', regex: /\btop[- ]rated\b/i },
  { rule: 'Superlative ("industry leading")', regex: /\bindustry[- ]leading\b/i },
  { rule: 'Superlative ("best")', regex: /\bbest\b/i },
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getCompetitorList(accountSettings) {
  const list = [...DEFAULT_COMPETITORS];
  const additionalRules = accountSettings?.additionalRules || '';
  const match = additionalRules.match(/competitors?\s*:\s*(.+)/i);
  if (match) {
    const extra = match[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    list.push(...extra);
  }
  return list;
}

// Checks shared by title, every bullet, and the description.
function checkProhibitedContent(field, text, competitors) {
  const issues = [];
  if (!text) return issues;

  for (const { rule, regex } of MEDICAL_PATTERNS) {
    const match = text.match(regex);
    if (match) issues.push({ field, severity: 'ERROR', rule, match: match[0], category: 'medical-claims' });
  }

  for (const { rule, regex } of PRICING_PATTERNS) {
    const match = text.match(regex);
    if (match) issues.push({ field, severity: 'ERROR', rule, match: match[0], category: 'pricing-claims' });
  }

  for (const { rule, regex } of SUPERLATIVE_PATTERNS) {
    const match = text.match(regex);
    if (match) issues.push({ field, severity: 'ERROR', rule, match: match[0], category: 'superlatives' });
  }

  for (const name of competitors) {
    const regex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i');
    const match = text.match(regex);
    if (match) {
      issues.push({
        field,
        severity: 'ERROR',
        rule: `Competitor name ("${name}")`,
        match: match[0],
        category: 'competitor-names',
      });
    }
  }

  return issues;
}

function checkTitle(title, accountSettings) {
  const issues = [];
  if (!title) return issues;

  const len = title.length;
  if (len > 200) {
    issues.push({
      field: 'Title',
      severity: 'ERROR',
      rule: 'Title exceeds 200 characters (Amazon suppression risk)',
      match: `${len} characters`,
      category: 'title-length',
    });
  } else if (len > 160) {
    issues.push({
      field: 'Title',
      severity: 'WARN',
      rule: 'Title exceeds 160 characters (above recommended range)',
      match: `${len} characters`,
      category: 'title-length',
    });
  }

  const specialMatch = title.match(SPECIAL_CHARS_REGEX);
  if (specialMatch) {
    issues.push({
      field: 'Title',
      severity: 'ERROR',
      rule: 'Title contains a disallowed special character (! $ ? _ { } ^ ¬ ¦)',
      match: specialMatch[0],
      category: 'title-characters',
    });
  }

  const brandName = accountSettings?.brandName?.trim();
  if (brandName) {
    const regex = new RegExp(`\\b${escapeRegex(brandName)}\\b`, 'gi');
    const matches = title.match(regex) || [];
    if (matches.length > 2) {
      issues.push({
        field: 'Title',
        severity: 'ERROR',
        rule: 'Brand name appears more than twice in the title',
        match: `"${brandName}" appears ${matches.length} times`,
        category: 'brand-frequency',
      });
    }
  }

  const words = title.toLowerCase().match(/[a-z0-9']+/g) || [];
  const counts = {};
  for (const word of words) {
    if (word.length <= 2 || STOPWORDS.has(word)) continue;
    counts[word] = (counts[word] || 0) + 1;
  }
  for (const [word, count] of Object.entries(counts)) {
    if (count > 2) {
      issues.push({
        field: 'Title',
        severity: 'WARN',
        rule: 'Word repeated more than twice in title (possible keyword stuffing)',
        match: `"${word}" appears ${count} times`,
        category: 'keyword-stuffing',
      });
    }
  }

  return issues;
}

// Returns the offending run of words, or null if no run exceeds 5 words.
// The leading "opener" label (e.g. "DURABLE DESIGN:" or just the first
// word) is excluded from the run-length count.
function findAllCapsRun(bullet) {
  const words = bullet.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  const isAllCapsWord = (word) => {
    const letters = word.replace(/[^A-Za-z]/g, '');
    return letters.length > 1 && letters === letters.toUpperCase();
  };

  // Detect a leading "LABEL:" style opener - a run of all-caps words where
  // the last one ends with a colon.
  let openerCount = 0;
  for (let i = 0; i < words.length; i++) {
    if (!isAllCapsWord(words[i])) break;
    if (words[i].includes(':')) {
      openerCount = i + 1;
      break;
    }
  }
  // No "LABEL:" found - exempt just the first word as the opener.
  if (openerCount === 0) openerCount = 1;

  const rest = words.slice(openerCount);

  let run = [];
  for (const word of rest) {
    if (isAllCapsWord(word)) {
      run.push(word);
      if (run.length > 5) return run.join(' ');
    } else {
      run = [];
    }
  }
  return null;
}

function checkBullets(bullets) {
  const issues = [];

  if (!Array.isArray(bullets) || bullets.length !== 5) {
    issues.push({
      field: 'Bullets',
      severity: 'ERROR',
      rule: 'Listing must contain exactly 5 bullets',
      match: `${Array.isArray(bullets) ? bullets.length : 0} bullet(s) returned`,
      category: 'bullet-count',
    });
  }

  (bullets || []).forEach((bullet, i) => {
    const field = `Bullet ${i + 1}`;
    if (typeof bullet !== 'string') return;

    if (bullet.length > 250) {
      issues.push({
        field,
        severity: 'ERROR',
        rule: 'Bullet exceeds 250 characters',
        match: `${bullet.length} characters`,
        category: 'bullet-length',
      });
    }

    if (bullet.includes('!')) {
      issues.push({
        field,
        severity: 'WARN',
        rule: 'Bullet contains an exclamation point',
        match: '!',
        category: 'bullet-formatting',
      });
    }

    const emojiMatch = bullet.match(EMOJI_REGEX);
    if (emojiMatch) {
      issues.push({
        field,
        severity: 'WARN',
        rule: 'Bullet contains an emoji',
        match: emojiMatch[0],
        category: 'bullet-formatting',
      });
    }

    const capsRun = findAllCapsRun(bullet);
    if (capsRun) {
      issues.push({
        field,
        severity: 'WARN',
        rule: 'Long run of ALL CAPS text (excluding the opening label)',
        match: capsRun,
        category: 'bullet-formatting',
      });
    }
  });

  return issues;
}

function checkDescription(description) {
  const issues = [];
  if (!description) return issues;

  const paragraphs = description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const paragraphCount = paragraphs.length || (description.trim() ? 1 : 0);

  if (paragraphCount > 3) {
    issues.push({
      field: 'Description',
      severity: 'WARN',
      rule: 'Description has more than 3 paragraphs',
      match: `${paragraphCount} paragraphs`,
      category: 'description-length',
    });
  }

  const wordCount = (description.match(/[a-z0-9'-]+/gi) || []).length;
  if (wordCount < 40) {
    issues.push({
      field: 'Description',
      severity: 'WARN',
      rule: 'Description is under 40 words (too thin)',
      match: `${wordCount} words`,
      category: 'description-length',
    });
  }

  return issues;
}

// Validates a generated listing { title, bullets, description } against
// the Amazon compliance checklist. Returns an array of
// { field, severity, rule, match } issues (empty array = all checks pass).
export function validateListing(output, accountSettings = {}) {
  const title = output?.title || '';
  const bullets = output?.bullets;
  const description = output?.description || '';
  const competitors = getCompetitorList(accountSettings);

  const issues = [
    ...checkTitle(title, accountSettings),
    ...checkBullets(bullets),
    ...checkDescription(description),
    ...checkProhibitedContent('Title', title, competitors),
    ...checkProhibitedContent('Description', description, competitors),
  ];

  if (Array.isArray(bullets)) {
    bullets.forEach((bullet, i) => {
      issues.push(...checkProhibitedContent(`Bullet ${i + 1}`, bullet, competitors));
    });
  }

  return issues;
}

export default validateListing;
