import GameCanvas from "./components/game/GameCanvas";

export default function Home() {
  return (
    <main className="h-screen w-screen flex flex-col bg-sky-blue overflow-hidden">
      <div className="flex-1 w-full">
        <GameCanvas />
      </div>
    </main>
  );
}
