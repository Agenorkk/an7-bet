/**
 * AN7 BET — Cloudflare Worker proxy for API-Football
 *
 * In Cloudflare, add the secret API_FOOTBALL_KEY (never paste the key into
 * this file or into public GitHub). Deploy this Worker and use its URL in
 * the website configuration.
 */
const API_BASE = "https://v3.football.api-sports.io";
const CACHE_SECONDS = 300;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }
    if (!env.API_FOOTBALL_KEY) {
      return json({ error: "API_FOOTBALL_KEY não configurada no Cloudflare Worker." }, 500);
    }

    const allowed = new Set(["fixtures", "odds", "leagues", "countries"]);
    const endpoint = url.pathname.replace(/^\/+/, "");
    if (!allowed.has(endpoint)) {
      return json({ error: "Endpoint inválido. Use /fixtures, /odds, /leagues ou /countries." }, 404);
    }

    const params = new URLSearchParams(url.searchParams);
    // Prevent callers from overriding API authentication.
    const target = API_BASE + "/" + endpoint + (params.size ? "?" + params.toString() : "");
    const cache = caches.default;
    const cacheKey = new Request(target, { method: "GET" });
    const cached = await cache.match(cacheKey);
    if (cached) return withCors(cached);

    try {
      const response = await fetch(target, {
        headers: { "x-apisports-key": env.API_FOOTBALL_KEY }
      });
      const body = await response.text();
      const headers = new Headers({
        "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=" + CACHE_SECONDS,
        ...corsHeaders()
      });
      const result = new Response(body, { status: response.status, headers });
      if (response.ok) ctx.waitUntil(cache.put(cacheKey, result.clone()));
      return result;
    } catch {
      return json({ error: "Não foi possível consultar a API de futebol agora." }, 502);
    }
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}
function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders())) headers.set(k, v);
  return new Response(response.body, { status: response.status, headers });
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() }
  });
}
