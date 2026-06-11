import { useState } from 'react';
import './App.css';
import SettingsPanel from './components/SettingsPanel';
import AccountSettings from './components/AccountSettings';
import ProductForm from './components/ProductForm';
import OutputCard from './components/OutputCard';
import ValidationPanel from './components/ValidationPanel';
import useLocalStorage from './hooks/useLocalStorage';
import { generateListing, ListingApiError } from './api';
import { validateListing } from './validator';

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
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setOutput(null);
    setIssues([]);

    try {
      const result = await generateListing({ apiKey, accountSettings, product });
      setOutput(result);
      setIssues(validateListing(result, accountSettings));
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
        <section className="output-section">
          <h2>Generated Listing</h2>
          <div className="output-cards">
            <OutputCard title="TITLE" content={output.title} />
            <OutputCard title="BULLETS" content={output.bullets} isList />
            <OutputCard title="DESCRIPTION" content={output.description} />
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
