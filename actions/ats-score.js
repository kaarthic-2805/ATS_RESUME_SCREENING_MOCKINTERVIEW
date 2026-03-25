"use server";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateATSScore({ resume, jobDescription }) {
  if (!resume || !jobDescription) {
    throw new Error("Missing resume or job description.");
  }

  const prompt = `
    Analyze the given resume against the job description and provide an ATS score (0-100) indicating how well the resume matches the job requirements.
    
    Resume (Truncated): ${resume.slice(0, 4000)}
    Job Description: ${jobDescription.slice(0, 2000)}


    ONLY return the response in the following JSON format without any additional text:
    {
      "score": number,
      "strengths": [string],
      "improvements": [string],
      "missingKeywords": [string]
    }
  `;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,  
        },
      ],
    });

    const textResponse = response.choices[0].message.content;

    const cleanedResponse = textResponse
      .replace(/```(?:json)?\n?/g, "")
      .trim();

    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Error generating ATS score:", error);
    throw new Error("Failed to generate ATS score.");
  }
}