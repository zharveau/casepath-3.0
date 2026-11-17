const SYSTEM_PROMPT = `You are the CasePath Intake Assistant, a preliminary information-organizing assistant for a tort-law website. You are not a lawyer and must not provide legal advice, decide whether a person has a valid claim, predict outcomes, estimate odds of success, calculate recoverable damages, or tell users what legal action to take. Do not claim to review evidence files; this chat receives text only. Help the user create a neutral factual timeline and identify missing information or questions to ask a licensed lawyer. Ask one focused follow-up question at a time. Explain general concepts such as duty, breach, causation, harm, and possible defences only at a high level, noting that the applicable law depends on jurisdiction and facts. Do not invent statutes, limitation periods, case law, or legal conclusions. Encourage prompt consultation with a licensed lawyer about deadlines. If the user shares highly sensitive information, advise them not to share it here and to remove identifying details. Never ask for full names, addresses, contact details, account numbers, or complete medical records. Keep responses concise, neutral, and empathetic. State when information is uncertain. If asked for a case summary, structure only the facts the user provided and clearly label unverified allegations as user-reported. This is an educational prototype, not a substitute for legal advice.`;

function corsHeaders(origin, allowedOrigin) {
  const allowed = allowedOrigin && origin === allowedOrigin ? origin : allowedOrigin || "null";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin, env.SITE_ORIGIN);
    if (request.method === "OPTIONS") return new Response(null, { headers });
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers });
    if (!env.OPENAI_API_KEY) return Response.json({ error: "AI service is not configured." }, { status: 503, headers });

    try {
      const body = await request.json();
      if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 12) {
        return Response.json({ error: "Please send between 1 and 12 messages." }, { status: 400, headers });
      }
      const messages = body.messages.map(m => {
        if (!m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string") throw new Error("Invalid message format.");
        return { role: m.role, content: m.content.slice(0, 3000) };
      });
      if (messages[messages.length - 1].role !== "user") throw new Error("The latest message must be from the user.");

      const aiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-6.2-astra",
          instructions: SYSTEM_PROMPT,
          input: messages.map(m => ({ role: m.role, content: [{ type: "input_text", text: m.content }] }))
        })
      });
      const result = await aiResponse.json();
      if (!aiResponse.ok) return Response.json({ error: "The AI provider returned an error." }, { status: 502, headers });
      const reply = (result.output || []).flatMap(item => item.content || []).filter(part => part.type === "output_text").map(part => part.text).join("\n").trim();
      if (!reply) return Response.json({ error: "No response was returned." }, { status: 502, headers });
      return Response.json({ reply }, { headers });
    } catch (error) {
      return Response.json({ error: error.message || "Invalid request." }, { status: 400, headers });
    }
  }
};
