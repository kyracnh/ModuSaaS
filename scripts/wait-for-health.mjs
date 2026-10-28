for (let i = 0; i < 60; i++) {
  try {
    const response = await fetch("http://localhost:3000/api/health");
    if (response.ok) process.exit(0);
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
console.error("Health check did not become ready");
process.exit(1);
