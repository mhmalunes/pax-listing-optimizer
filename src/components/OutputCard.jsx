import { useState } from 'react';

// Grows a textarea to fit its content so edited fields keep reading like
// the static cards they replace, instead of showing a scrollbar.
function autosize(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

function OutputCard({ title, content, isList, onChange }) {
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

  const handleInput = (e) => autosize(e.target);

  const handleBulletChange = (index, value) => {
    const next = [...bullets];
    next[index] = value;
    onChange(next);
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
              <li key={i}>
                <textarea
                  className="output-edit-textarea"
                  value={bullet}
                  onChange={(e) => handleBulletChange(i, e.target.value)}
                  onInput={handleInput}
                  ref={autosize}
                  rows={1}
                  aria-label={`Bullet ${i + 1}`}
                />
              </li>
            ))}
          </ol>
        ) : (
          <textarea
            className="output-edit-textarea output-edit-textarea-block"
            value={text}
            onChange={(e) => onChange(e.target.value)}
            onInput={handleInput}
            ref={autosize}
            rows={1}
            aria-label={title}
          />
        )}
      </div>
    </div>
  );
}

export default OutputCard;
