export const dynamic = "force-dynamic";

export default function HomePage() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

  return (
    <main className="page">
      <div className="card">
        <span className="eyebrow">Turborepo Starter</span>
        <h1>Next.js frontend + NestJS API</h1>
        <p>
          Your monorepo is ready !! Check the pipline !!. Start both apps with <code>pnpm dev</code>.
        </p>
        <a href={`${apiBaseUrl}/health`} target="_blank" rel="noreferrer">
          Check the API health endpoint
        </a>
      </div>
    </main>
  );
}
