import { useState } from 'react';

function SettingsPanel({ apiKey, onApiKeyChange }) {
  const [open, setOpen] = useState(!apiKey);

  return (
    <section className="panel">
      <div className="panel-header" onClick={() => setOpen((o) => !o)}>
        <h2>API Settings</h2>
        <span className={`chevron ${open ? 'open' : ''}`}>▶</span>
      </div>
      {open && (
        <div className="panel-body">
          <div>
            <label htmlFor="api-key">Claude API key</label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="sk-ant-..."
              autoComplete="off"
              spellCheck={false}
            />
            <p className="field-hint">
              For production, this call moves to a serverless function so the key never touches the client.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default SettingsPanel;
