import { getLeetCodeStats } from "@/lib/stats";

export const dynamic = "force-static";
export const revalidate = 1800;

export async function GET() {
  return Response.json(await getLeetCodeStats());
}
