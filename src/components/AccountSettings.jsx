const REGIONS = [
  { value: 'US', label: 'United States (US)' },
  { value: 'CA', label: 'Canada (CA)' },
  { value: 'UK', label: 'United Kingdom (UK)' },
  { value: 'DE', label: 'Germany (DE)' },
  { value: 'FR', label: 'France (FR)' },
  { value: 'IT', label: 'Italy (IT)' },
  { value: 'ES', label: 'Spain (ES)' },
  { value: 'JP', label: 'Japan (JP)' },
  { value: 'AU', label: 'Australia (AU)' },
  { value: 'MX', label: 'Mexico (MX)' },
];

function AccountSettings({ settings, onChange }) {
  const update = (field) => (e) => {
    onChange({ ...settings, [field]: e.target.value });
  };

  return (
    <section className="panel">
      <div className="panel-static-header">
        <h2>Account Settings</h2>
      </div>
      <div className="panel-body">
        <div className="field-row">
          <div>
            <label htmlFor="brand-name">Brand name</label>
            <input
              id="brand-name"
              type="text"
              value={settings.brandName}
              onChange={update('brandName')}
              placeholder="Pax Distribution"
            />
          </div>
          <div>
            <label htmlFor="region">Region</label>
            <select id="region" value={settings.region} onChange={update('region')}>
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="brand-voice">Brand voice</label>
          <textarea
            id="brand-voice"
            value={settings.brandVoice}
            onChange={update('brandVoice')}
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="additional-rules">Additional rules (optional)</label>
          <textarea
            id="additional-rules"
            value={settings.additionalRules}
            onChange={update('additionalRules')}
            rows={3}
            placeholder="e.g. Competitors: Brand A, Brand B, Brand C"
          />
          <p className="field-hint">
            Add a line like "Competitors: Brand A, Brand B" to extend the validator's competitor name list.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AccountSettings;
