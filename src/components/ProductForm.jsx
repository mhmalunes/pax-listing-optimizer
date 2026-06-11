function ProductForm({ product, onChange }) {
  const update = (field) => (e) => {
    onChange({ ...product, [field]: e.target.value });
  };

  return (
    <section className="panel">
      <div className="panel-static-header">
        <h2>Product Info</h2>
      </div>
      <div className="panel-body">
        <div className="field-row">
          <div>
            <label htmlFor="product-name">Product name</label>
            <input
              id="product-name"
              type="text"
              value={product.productName}
              onChange={update('productName')}
              placeholder="e.g. Heavy-Duty Dent Puller Kit"
            />
          </div>
          <div>
            <label htmlFor="primary-keyword">Primary keyword</label>
            <input
              id="primary-keyword"
              type="text"
              value={product.primaryKeyword}
              onChange={update('primaryKeyword')}
              placeholder="e.g. dent puller kit"
            />
          </div>
        </div>

        <div>
          <label htmlFor="current-title">Current title (optional)</label>
          <textarea
            id="current-title"
            value={product.currentTitle}
            onChange={update('currentTitle')}
            rows={2}
            placeholder="Paste the existing listing title, if any"
          />
        </div>

        <div>
          <label htmlFor="features">Features &amp; specs (one per line)</label>
          <textarea
            id="features"
            value={product.features}
            onChange={update('features')}
            rows={6}
            placeholder={'Spring-loaded slide hammer\n10-piece glue tab set\nFits panels up to 2mm thick\n...'}
          />
        </div>

        <div className="field-row">
          <div>
            <label htmlFor="secondary-keywords">Secondary keywords (comma separated)</label>
            <input
              id="secondary-keywords"
              type="text"
              value={product.secondaryKeywords}
              onChange={update('secondaryKeywords')}
              placeholder="e.g. paintless dent repair, glue puller, body shop tools"
            />
          </div>
          <div>
            <label htmlFor="target-customer">Target customer</label>
            <input
              id="target-customer"
              type="text"
              value={product.targetCustomer}
              onChange={update('targetCustomer')}
              placeholder="e.g. DIY auto enthusiasts and body shop techs"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductForm;
