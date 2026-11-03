export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  if (!/^CCSL-\d{6}-[A-F0-9]{12}$/.test(id)) {
    return new Response("Invalid salary slip link.", { status: 400 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return new Response("Salary slip download is temporarily unavailable.", { status: 503 });
  }
  const upstream = await fetch(
    supabaseUrl.replace(/\/$/, "") + "/functions/v1/download-salary-slip?id=" + encodeURIComponent(id),
    { headers: { apikey: anonKey }, cache: "no-store" }
  );
  if (!upstream.ok) {
    const message = await upstream.text();
    return new Response(message || "Salary slip not found.", { status: upstream.status, headers: { "Cache-Control": "no-store" } });
  }
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="' + id + '.pdf"',
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
