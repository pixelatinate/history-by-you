import Link from "next/link";
import { Map } from "@/components/Map";
import { AuthControls } from "@/components/AuthControls";
import { getLocations } from "@/lib/data";

export const metadata = {
  title: "Map — History By You",
};

export default async function MapPage() {
  const locations = await getLocations();

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-black/10 px-4 py-3 dark:border-white/10">
        <Link href="/" className="font-semibold">
          History By You
        </Link>
        <p className="hidden text-sm text-zinc-500 sm:block">{locations.length} locations</p>
        <AuthControls />
      </header>
      <div className="flex-1">
        <Map locations={locations} />
      </div>
    </div>
  );
}
