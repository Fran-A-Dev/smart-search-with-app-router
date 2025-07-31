import SearchBar from "@/components/search-bar";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-gray-900 shadow-md">
      <div className="flex items-center space-x-8">
        <div className="text-xl font-bold text-white">
          <Link href="/" className="hover:text-blue-400 transition-colors">
            Smart Search Media
          </Link>
        </div>

        <nav className="hidden md:flex space-x-6">
          <Link
            href="/blog"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Articles
          </Link>
          <Link
            href="/categories"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Categories
          </Link>
        </nav>
      </div>

      <div className="flex items-center">
        <SearchBar />
      </div>
    </header>
  );
}
