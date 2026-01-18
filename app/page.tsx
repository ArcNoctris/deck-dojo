export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-6xl font-bold font-heading text-neon-cyan mb-4">DECK DOJO</h1>
      <p className="text-xl text-strike-red">Tactical Zen Initiated.</p>
      <div className="mt-8 p-4 bg-gunmetal-grey border border-focus-amber rounded-none">
         <code className="text-sm">System Status: Online</code>
      </div>
    </div>
  );
}
