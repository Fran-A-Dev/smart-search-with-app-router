import { LinkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

// Custom heading component with clickable anchor links
export default function Heading({ level, children, id, ...props }) {
  const Tag = `h${level}`;
  return (
    <Tag
      id={id.toString()}
      className={`group flex items-center ${
        level === 1
          ? "text-4xl font-bold text-gray-100 mb-6 leading-tight"
          : level === 2
          ? "text-3xl font-semibold text-gray-200 mt-8 mb-4 leading-snug"
          : level === 3
          ? "text-2xl font-semibold text-gray-300 mt-6 mb-3 leading-normal"
          : level === 4
          ? "text-xl font-medium text-gray-400 mt-5 mb-2 leading-relaxed"
          : "text-lg font-medium text-gray-500 mt-4 mb-2 leading-relaxed"
      }`}
      {...props}
    >
      <Link
        href={`#${id}`}
        className="no-underline flex items-center group-hover:text-blue-500"
      >
        {children}
        <LinkIcon className="ml-2 inline-block h-5 w-5 text-gray-400 group-hover:text-blue-500" />
      </Link>
    </Tag>
  );
}
