
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const origin = request.headers.get("Origin");
    const allowedOrigins = [
      "https://circuitformula.in",
      "https://www.circuitformula.in"
    ];

    const cors = {
      "Access-Control-Allow-Origin":
        allowedOrigins.includes(origin) ? origin : "https://circuitformula.in",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, X-Device-Key"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (url.pathname === "/api/health") {
      return Response.json({
        ok: true,
        service: "CircuitFormula IoT",
        status: "running"
      }, { headers: cors });
    }

    if (url.pathname.startsWith("/api/")) {
      return Response.json({
        error: "API endpoint not implemented yet"
      }, { status: 404, headers: cors });
    }

    return env.ASSETS.fetch(request);
  }
};

