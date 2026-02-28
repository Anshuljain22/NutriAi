import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { query } = body;

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: "Invalid query." }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing from environment variables.");
            return NextResponse.json({ error: 'AI capabilities are currently unavailable.' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are an expert nutritionist database. 
            Provide the nutritional information for the following food item or meal: "${query}".
            
            Return the output STRICTLY in the following JSON format without any markdown formatting or extra text:
            {
                "name": "Proper name of the food",
                "serving": "Standard serving size (e.g., '1 cup', '100g', '1 medium')",
                "calories": 0,
                "protein": 0.0,
                "carbs": 0.0,
                "fat": 0.0,
                "fiber": 0.0
            }
            
            If the query is too vague, make a best guess for a standard serving.
            Make sure your numbers are realistic.
             DO NOT wrap the response in \`\`\`json \`\`\`. Start directly with the { and end with the }.
        `;

        const result = await model.generateContent(prompt);
        let aiResponse = result.response.text().trim();

        // Try to parse the json response
        if (aiResponse.startsWith("\`\`\`json")) {
            aiResponse = aiResponse.substring(7);
        }
        if (aiResponse.startsWith("\`\`\`")) {
            aiResponse = aiResponse.substring(3);
        }
        if (aiResponse.endsWith("\`\`\`")) {
            aiResponse = aiResponse.substring(0, aiResponse.length - 3);
        }
        aiResponse = aiResponse.trim();

        let nutritionData;
        try {
            nutritionData = JSON.parse(aiResponse);
        } catch (e) {
            console.error("Failed to parse Gemini response:", aiResponse);
            return NextResponse.json({ error: "AI failed to understand the food item." }, { status: 500 });
        }

        // Validate structure
        if (!nutritionData.name || typeof nutritionData.calories !== 'number') {
            return NextResponse.json({ error: "Invalid response from AI." }, { status: 500 });
        }

        return NextResponse.json({ item: nutritionData }, { status: 200 });

    } catch (error) {
        console.error("Error in AI nutrition search:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
