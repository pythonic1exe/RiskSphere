type AuditTestPresentation = { status: string; result: string | null };

export function summarizeAuditTests(tests: AuditTestPresentation[]) {
  const total = tests.length;
  const completed = tests.filter((test) => test.status === 'COMPLETED').length;
  const pass = tests.filter((test) => test.result === 'PASS').length;
  const exception = tests.filter((test) => test.result === 'EXCEPTION').length;
  const fail = tests.filter((test) => test.result === 'FAIL').length;
  const notApplicable = tests.filter((test) => test.result === 'NOT_APPLICABLE').length;
  const pending = total - completed;
  return {
    total,
    completed,
    pass,
    exception,
    fail,
    notApplicable,
    pending,
    completionPercent: total ? Math.round((completed / total) * 100) : 0,
  };
}
