export async function GET(req: Request): Promise<Response> {
  const cookies = req.headers.get("cookie") || "";
  const connected = cookies.includes("gh_token=");
  return Response.json({ connected });
}


