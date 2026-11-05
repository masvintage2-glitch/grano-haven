// Grano × HAVEN · API de sincronización (Netlify Functions + Netlify Blobs)
// Guarda cada acción (pedido, pago, aviso…) como un evento. Los dispositivos
// piden los eventos nuevos cada 1,5 s y reconstruyen el estado.
import { getStore } from "@netlify/blobs";

const MANAGER_ONLY = new Set(["attend","tpay","tfree","tseat","adv","av","price","set","alb","push","ship","time"]);
const CUSTOMER = new Set(["seat","send","call","pay","join","newuser","buy","subpause"]);
const PIN = () => (process.env.MANAGER_PIN || "1234");
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

async function currentEpoch(store) {
  let e = await store.get("epoch");
  if (!e) { e = "e" + Date.now(); await store.set("epoch", e); }
  return e;
}

export default async (req) => {
  const store = getStore({ name: "grano-haven", consistency: "strong" });
  const url = new URL(req.url);
  const route = url.pathname.replace(/^\/api\/?/, "");

  try {
    if (route === "events" && req.method === "GET") {
      const epoch = await currentEpoch(store);
      let since = parseInt(url.searchParams.get("since") || "0", 10) || 0;
      const full = url.searchParams.get("epoch") !== epoch;
      if (full) since = 0;
      const { blobs } = await store.list({ prefix: `ev/${epoch}/` });
      const keys = blobs.map(b => b.key).sort().slice(since);
      const events = (await Promise.all(keys.map(k => store.get(k, { type: "json" })))).filter(Boolean);
      return json({ epoch, full, events });
    }

    if (route === "events" && req.method === "POST") {
      const body = await req.json().catch(() => null);
      const ev = body && body.ev;
      if (!ev || typeof ev.type !== "string" || JSON.stringify(ev).length > 20000) return json({ ok: false, error: "evento no válido" }, 400);
      if (!CUSTOMER.has(ev.type) && !MANAGER_ONLY.has(ev.type)) return json({ ok: false, error: "tipo desconocido" }, 400);
      if (MANAGER_ONLY.has(ev.type) && req.headers.get("x-pin") !== PIN()) return json({ ok: false, error: "PIN incorrecto" }, 401);
      const epoch = await currentEpoch(store);
      const key = `ev/${epoch}/${String(Date.now()).padStart(15, "0")}-${Math.random().toString(36).slice(2, 8)}`;
      await store.setJSON(key, ev);
      return json({ ok: true });
    }

    if (route === "login" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      return json({ ok: String(body.pin || "") === PIN() }, String(body.pin || "") === PIN() ? 200 : 401);
    }

    if (route === "reset" && req.method === "POST") {
      if (req.headers.get("x-pin") !== PIN()) return json({ ok: false }, 401);
      const old = await currentEpoch(store);
      await store.set("epoch", "e" + Date.now());
      // borrar eventos antiguos (no bloquea la respuesta si falla)
      try { const { blobs } = await store.list({ prefix: `ev/${old}/` }); await Promise.all(blobs.map(b => store.delete(b.key))); } catch (e) {}
      return json({ ok: true });
    }

    return json({ ok: false, error: "ruta no encontrada" }, 404);
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) }, 500);
  }
};

export const config = { path: "/api/*" };
