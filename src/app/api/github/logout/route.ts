export async function POST(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Set-Cookie": `gh_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    },
  });
}


