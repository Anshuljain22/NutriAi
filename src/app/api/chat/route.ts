import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not set.");
            return NextResponse.json(
                { reply: "I'm currently unable to connect to my knowledge base because the API key is missing. Please contact the administrator." },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const systemInstruction = `You are a specialized AI assistant for a fitness and nutrition platform. Your primary role is to provide real, accurate, and helpful answers strictly related to fitness, workouts, nutrition, diet, wellness, and healthy lifestyle choices. If a user asks a question that is completely unrelated to these topics, you must politely decline to answer, stating that your expertise is restricted to fitness and nutrition.

IMPORTANT FORMATTING RULES:
1. Be CONCISE and DIRECT. Do not write long paragraphs.
2. Structure your response using Markdown.
3. Use bullet points lists (•) for multiple items, tips, or steps.
4. Bold **key terms** for readability.
5. Limit responses to 3-4 short sections maximum. Never output a wall of text.
6. Use emojis sparingly but effectively to make the message engaging.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        const reply = response.text || "I'm sorry, I couldn't generate a response at this time.";

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
