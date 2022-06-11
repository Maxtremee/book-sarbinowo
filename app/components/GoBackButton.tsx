import { Link } from "@remix-run/react";

export default function GoBackButton() {
  return (
    <Link
      to=".."
      className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
    >
      Go back
    </Link>
  );
}
