import { OpenAI } from "openai";
import { resume } from "../../data/resume";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildSystemPrompt() {
  const { personal, experience = [], education = [], internships = [], projects = [] } = resume;
  const linkList = [
    personal?.links?.website,
    personal?.links?.github,
    personal?.links?.linkedin,
    personal?.links?.resumePdf,
    ...experience.map((e) => e.link).filter(Boolean),
    ...education.map((e) => e.link).filter(Boolean),
    ...internships.map((e) => e.link).filter(Boolean),
    ...projects.map((p) => p.link).filter(Boolean)
  ].filter(Boolean);

  const summary = `You are a helpful, concise career assistant for ${personal.name} (${personal.title}). You answer questions about their background and provide direct links when relevant. Prefer specific, quantified outcomes. If a question is unrelated to the resume, briefly answer and steer back to the candidate's experience.`;

  const inventory = {
    personal,
    experience,
    education,
    internships,
    projects,
    links: linkList
  };

  return `${summary}\n\nResume Data (JSON):\n${JSON.stringify(inventory, null, 2)}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildSystemPrompt() },
        ...messages
      ],
      temperature: 0.4,
      max_tokens: 600
    });

    const content = response.choices?.[0]?.message?.content || "";
    return res.status(200).json({ content });
  } catch (err) {
    console.error(err);
    const message = err?.message || "Unknown error";
    return res.status(500).json({ error: message });
  }
} 