export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 py-24 text-center dark:bg-black">
      <h1 className="text-4xl font-semibold tracking-tight">History By You</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        A collaborative map of local history — the story behind the park
        next door, told by the people who live there.
      </p>
      <a
        href="/map"
        className="rounded-full bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Open the map
      </a>
    </div>
  );
}
