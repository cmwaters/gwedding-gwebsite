import GameCanvas from "./components/game/GameCanvas";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-retro-cream p-4">
      <h1 className="text-2xl md:text-3xl font-pixel text-charcoal mb-4 text-center">
        Run to Villa Bettoni
      </h1>
      <div className="w-full max-w-4xl aspect-[8/3]">
        <GameCanvas />
      </div>
      <p className="mt-4 text-xs md:text-sm font-pixel text-orange text-center">
        Help the dog reach the wedding venue!
      </p>
    </main>
  );
}
