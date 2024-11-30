import SearchBar from "@/components/search-bar";
import Link from "next/link";
export default function Navbar() {
  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-#000a2a shadow-md">
      <div className="text-xl font-bold">
        <Link href="/">Home</Link>
      </div>

      <div className="flex">
        <SearchBar />
      </div>
    </header>
  );
}
