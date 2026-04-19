import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function scoreUrgency(description: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an urgency scoring assistant for an NGO. Read this community need report and return a JSON object only, no extra text. Format: { "score": number from 1 to 10, "reason": "one sentence", "category": "one of [food, water, medical, shelter, education, other]" }. Report: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["score", "reason", "category"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Urgency Scoring Error:", error);
    return { score: 5, reason: "AI scoring failed, defaulted to medium.", category: "other" };
  }
}

export async function matchVolunteers(report: any, volunteers: any[]) {
  try {
    const volunteersList = volunteers.map(v => `Name: ${v.name}, Skills: ${v.skills.join(", ")}, Location: ${v.location}`).join("\n");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a volunteer coordinator assistant. A community need has been reported. Match the best 3 volunteers from the list below. Return JSON only: { "matches": [ { "name": string, "reason": string, "matchScore": number, "id": string } ] }. 
      Need: ${JSON.stringify(report)}
      Volunteers: ${volunteersList}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  matchScore: { type: Type.NUMBER },
                  id: { type: Type.STRING }
                },
                required: ["name", "reason", "matchScore", "id"]
              }
            }
          },
          required: ["matches"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Volunteer Matching Error:", error);
    return { matches: [] };
  }
}
