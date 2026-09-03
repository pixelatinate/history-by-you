import { Map } from "@/components/Map";
import { getLocations } from "@/lib/data";

export const metadata = {
  title: "Map — History By You",
};

export default async function MapPage() {
  const locations = await getLocations();

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
        <a href="/" className="font-semibold">
          History By You
        </a>
        <p className="text-sm text-zinc-500">{locations.length} locations</p>
      </header>
      <div className="flex-1">
        <Map locations={locations} />
      </div>
    </div>
  );
}
