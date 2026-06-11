import { useState } from 'react';

function OutputCard({ title, content, isList }) {
  const [copied, setCopied] = useState(false);

  const bullets = Array.isArray(content) ? content : [];
  const text = typeof content === 'string' ? content : '';

  const textToCopy = isList
    ? bullets.map((bullet, i) => `${i + 1}. ${bullet}`).join('\n')
    : text;

  const charCount = isList
    ? bullets.reduce((sum, bullet) => sum + bullet.length, 0)
    : text.length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable - ignore
    }
  };

  return (
    <div className="output-card">
      <div className="output-card-header">
        <h3>{title}</h3>
        <div className="output-card-meta">
          <span className="char-count">{charCount} chars</span>
          <button type="button" className="copy-btn" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="output-card-body">
        {isList ? (
          <ol>
            {bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ol>
        ) : (
          <p className="output-text">{text}</p>
        )}
      </div>
    </div>
  );
}

export default OutputCard;
