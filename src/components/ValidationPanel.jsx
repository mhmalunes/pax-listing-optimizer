import { CHECK_CATEGORIES } from '../validator';

function ValidationPanel({ issues }) {
  return (
    <section className="panel">
      <div className="panel-static-header">
        <h2>Compliance Validation</h2>
      </div>
      <div className="panel-body">
        <ul className="check-list">
          {CHECK_CATEGORIES.map((category) => {
            const categoryIssues = issues.filter((issue) => issue.category === category.id);
            const hasError = categoryIssues.some((i) => i.severity === 'ERROR');
            const level = categoryIssues.length === 0 ? 'pass' : hasError ? 'fail' : 'warn';
            const icon = level === 'pass' ? '✓' : level === 'warn' ? '!' : '✗';
            return (
              <li key={category.id} className={`check-item ${level}`}>
                <div className="check-item-header">
                  <span className="check-icon">{icon}</span>
                  <span className="check-label">{category.label}</span>
                </div>
                {level !== 'pass' && (
                  <ul className="issue-list">
                    {categoryIssues.map((issue, i) => (
                      <li key={i} className={`issue issue-${issue.severity.toLowerCase()}`}>
                        <span className={`issue-severity issue-severity-${issue.severity.toLowerCase()}`}>
                          {issue.severity}
                        </span>
                        <span className="issue-field">{issue.field}</span>
                        <span className="issue-rule">{issue.rule}</span>
                        <code className="issue-match">{issue.match}</code>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default ValidationPanel;
