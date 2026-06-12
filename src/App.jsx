import { useEffect, useRef, useState } from 'react';
import './App.css';
import SettingsPanel from './components/SettingsPanel';
import AccountSettings from './components/AccountSettings';
import ProductForm from './components/ProductForm';
import OutputCard from './components/OutputCard';
import ValidationPanel from './components/ValidationPanel';
import useLocalStorage from './hooks/useLocalStorage';
import { generateListing, ListingApiError } from './api';
import { validateListing, getValidationSummary } from './validator';

const DEFAULT_ACCOUNT_SETTINGS = {
  brandName: '',
  brandVoice:
    'Professional but friendly, no hype, clear and direct. More information, less sales pitch.',
  region: 'US',
  additionalRules: '',
};

const DEFAULT_PRODUCT = {
  productName: '',
  currentTitle: '',
  features: '',
  primaryKeyword: '',
  secondaryKeywords: '',
  targetCustomer: '',
};

function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function App() {
  const [apiKey, setApiKey] = useLocalStorage('pax_api_key', '');
  const [accountSettings, setAccountSettings] = useLocalStorage(
    'pax_account_settings',
    DEFAULT_ACCOUNT_SETTINGS,
  );
  const [product, setProduct] = useState(DEFAULT_PRODUCT);

  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationId, setGenerationId] = useState(0);

  const issues = validateListing(output, accountSettings);

  const outputRef = useRef(null);

  useEffect(() => {
    if (generationId > 0) {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generationId]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const result = await generateListing({ apiKey, accountSettings, product });
      setOutput(result);
      setGenerationId((id) => id + 1);
    } catch (err) {
      if (err instanceof ListingApiError) {
        setError({ message: err.message, raw: err.rawText });
      } else {
        setError({ message: err.message || 'Something went wrong. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOutputField = (field) => (value) => {
    setOutput((prev) => ({ ...prev, [field]: value }));
  };

  const handleExport = () => {
    if (!output) return;

    const lines = [
      'TITLE',
      output.title,
      '',
      'BULLETS',
      ...output.bullets.map((bullet, i) => `${i + 1}. ${bullet}`),
      '',
      'DESCRIPTION',
      output.description,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const filename = slugify(product.productName || 'listing') || 'listing';

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const summary = getValidationSummary(issues);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pax Listing Optimizer</h1>
        <p className="subtitle">
          Amazon-ready copy. Brand rules applied. Compliance checked.
        </p>
      </header>

      <SettingsPanel apiKey={apiKey} onApiKeyChange={setApiKey} />
      <AccountSettings settings={accountSettings} onChange={setAccountSettings} />
      <ProductForm product={product} onChange={setProduct} />

      <button
        type="button"
        className="generate-btn"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading && <span className="spinner" aria-hidden="true" />}
        {loading ? 'Generating…' : 'Generate Listing'}
      </button>

      {error && (
        <div className="error-banner">
          <p>{error.message}</p>
          {error.raw && <pre>{error.raw}</pre>}
        </div>
      )}

      {output && (
        <section className="output-section" ref={outputRef}>
          <div className="output-section-header">
            <h2>Generated Listing</h2>
            <div className={`validation-badge validation-badge-${summary.level}`}>
              {summary.label}
            </div>
          </div>
          <div className="output-cards">
            <OutputCard title="TITLE" content={output.title} onChange={updateOutputField('title')} />
            <OutputCard title="BULLETS" content={output.bullets} isList onChange={updateOutputField('bullets')} />
            <OutputCard title="DESCRIPTION" content={output.description} onChange={updateOutputField('description')} />
          </div>
          <div className="export-row">
            <button type="button" className="export-btn" onClick={handleExport}>
              Export .txt
            </button>
          </div>
          <ValidationPanel issues={issues} />
        </section>
      )}
    </div>
  );
}

export default App;
