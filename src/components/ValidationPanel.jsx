import { CHECK_CATEGORIES } from '../validator';

function ValidationPanel({ issues }) {
  const allPassed = issues.length === 0;
  const errorCount = issues.filter((i) => i.severity === 'ERROR').length;
  const warnCount = issues.filter((i) => i.severity === 'WARN').length;

  return (
    <section className="panel">
      <div className="panel-static-header">
        <h2>Compliance Validation</h2>
      </div>
      <div className="panel-body">
        <div className={`validation-summary ${allPassed ? 'pass' : 'fail'}`}>
          {allPassed
            ? '✓ All compliance checks passed'
            : `✗ ${errorCount} error${errorCount === 1 ? '' : 's'}, ${warnCount} warning${warnCount === 1 ? '' : 's'}`}
        </div>

        <ul className="check-list">
          {CHECK_CATEGORIES.map((category) => {
            const categoryIssues = issues.filter((issue) => issue.category === category.id);
            const passed = categoryIssues.length === 0;
            return (
              <li key={category.id} className={`check-item ${passed ? 'pass' : 'fail'}`}>
                <div className="check-item-header">
                  <span className="check-icon">{passed ? '✓' : '✗'}</span>
                  <span className="check-label">{category.label}</span>
                </div>
                {!passed && (
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
