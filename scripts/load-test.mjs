const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const routes = ["/", "/products", "/projects", "/articles", "/about", "/faq", "/contact", "/quote"];

function percentile(values, fraction) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))] || 0;
}

for (const users of [10, 25, 50, 100]) {
  const started = performance.now();
  const requests = Array.from({ length: users }, (_, index) => {
    const requestStarted = performance.now();
    return fetch(`${baseURL}${routes[index % routes.length]}`, { signal: AbortSignal.timeout(15_000) })
      .then((response) => ({ ok: response.ok, duration: performance.now() - requestStarted, status: response.status }))
      .catch(() => ({ ok: false, duration: performance.now() - requestStarted, status: 0 }));
  });
  const results = await Promise.all(requests);
  const durations = results.map((result) => result.duration);
  const errors = results.filter((result) => !result.ok).length;
  console.log(`${users} users: total=${Math.round(performance.now() - started)}ms average=${Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)}ms p95=${Math.round(percentile(durations, 0.95))}ms errors=${errors}`);
  if (errors) process.exitCode = 1;
}
