function sendError(res, status, code, message) {
  return res.status(status).json({ success: false, error: { code, message } });
}

function getConfig() {
  return {
    url: String(process.env.SUPABASE_URL || "").replace(/\/$/, ""),
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  };
}

function headers(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation"
  };
}

export default async function handler(req, res) {
  const { url, key } = getConfig();
  if (!url || !key) return sendError(res, 503, "DATABASE_NOT_CONFIGURED", "Supabase environment variables are not configured yet.");

  if (req.method === "GET") {
    try {
      const r = await fetch(`${url}/rest/v1/messages?select=id,name,professional,message,reply,created_at&is_visible=eq.true&order=created_at.asc&limit=100`, { headers: headers(key) });
      const data = await r.json();
      if (!r.ok) return sendError(res, 502, "DATABASE_READ_FAILED", "Unable to load messages from Supabase.");
      return res.status(200).json({ success: true, count: data.length, data });
    } catch {
      return sendError(res, 502, "DATABASE_UNAVAILABLE", "The message database could not be reached.");
    }
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const name = String(body.name || "").trim();
    const professional = String(body.professional || "General").trim();
    const message = String(body.message || "").trim();

    if (name.length < 2 || name.length > 40) return sendError(res, 400, "INVALID_NAME", "Name must be between 2 and 40 characters.");
    if (message.length < 1 || message.length > 500) return sendError(res, 400, "INVALID_MESSAGE", "Message must be between 1 and 500 characters.");
    if (!["General", "Wilan", "Arman", "Sherlyn", "Madelain"].includes(professional)) return sendError(res, 400, "INVALID_TARGET", "Invalid professional selected.");

    try {
      const r = await fetch(`${url}/rest/v1/messages`, {
        method: "POST",
        headers: headers(key),
        body: JSON.stringify({ name, professional, message })
      });
      const data = await r.json();
      if (!r.ok) return sendError(res, 502, "DATABASE_WRITE_FAILED", "Unable to save the message.");
      return res.status(201).json({ success: true, data: data[0] });
    } catch {
      return sendError(res, 502, "DATABASE_UNAVAILABLE", "The message database could not be reached.");
    }
  }

  return sendError(res, 405, "METHOD_NOT_ALLOWED", "Only GET and POST are supported.");
}
