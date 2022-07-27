import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getUsersByName } from "~/models/user.server";
import { requireUser } from "~/session.server";

export type LoaderData = {
  users: Awaited<ReturnType<typeof getUsersByName>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  const params = new URL(request.url).searchParams;
  const searchStr = params.get("name") as string;
  const limit = parseInt(params.get("limit") as string)

  const users = await getUsersByName(searchStr, limit);
  return json<LoaderData>({ users });
};
