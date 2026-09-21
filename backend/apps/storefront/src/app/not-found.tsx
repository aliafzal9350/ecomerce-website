import { Text } from "@modules/common/components/ui"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-semibold text-ui-fg-base">Page not found</h1>
      <p className="text-sm text-ui-fg-subtle">
        The page you tried to access does not exist.
      </p>
      <Link className="flex gap-x-1 items-center group text-ui-fg-interactive hover:underline" href="/">
        <Text className="text-ui-fg-interactive">Go to frontpage</Text>
        <svg
          className="group-hover:rotate-45 ease-in-out duration-150 w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </div>
  )
}
