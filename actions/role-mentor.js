"use server";

import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Debug function
const debugDB = (message, data) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DB Debug] ${message}:`, data);
  }
};

export async function createRoleMentor(role) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser) {
      throw new Error("User not found in database");
    }

    const prompt = `
You are a JSON API.

Return ONLY valid JSON. No explanation, no markdown.

STRICT FORMAT:
{"tasks":[{"day":1,"title":"string","description":"string"}]}

Rules:
- Must be valid JSON
- No trailing commas
- No comments
- No extra text outside JSON
- Use double quotes only
- Escape special characters

Generate a 10-day learning path for becoming a ${role}.
Each day must have 2-3 tasks.
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }, 
    });

    const rawText = response.choices[0].message.content || "";

    // ✅ Extract JSON
    const jsonMatch = rawText.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/);

    if (!jsonMatch) {
      console.error("❌ No JSON found:", rawText);
      throw new Error("AI did not return JSON");
    }

    let learningPath;

    try {
      learningPath = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("❌ First parse failed");

      // ✅ Strong cleaner
      let fixedText = jsonMatch[0];

      // Remove newlines inside strings
      fixedText = fixedText.replace(/\n/g, " ").replace(/\r/g, "");

      // Remove trailing commas
      fixedText = fixedText.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");

      // Remove invalid control chars
      fixedText = fixedText.replace(/[\u0000-\u001F]+/g, "");

      try {
        learningPath = JSON.parse(fixedText);
      } catch (e) {
        console.error("❌ Final parse failed:", fixedText);
        throw new Error("Invalid AI response format");
      }
    }

    if (!learningPath?.tasks || !Array.isArray(learningPath.tasks)) {
      throw new Error("Invalid AI structure");
    }

    const roleMentor = await db.roleMentor.create({
      data: {
        userId: dbUser.id,
        role,
        tasks: {
          create: learningPath.tasks.map((task) => ({
            title: task.title || "",
            description: task.description || "",
            day: task.day || 1,
          })),
        },
      },
    });

    return roleMentor;
  } catch (error) {
    console.error("Error in createRoleMentor:", error);
    throw new Error(error.message || "Failed to create role mentor");
  }
}

export async function getRoleMentor() {
  try {
    const user = await currentUser();
    if (!user) throw new Error("User not authenticated");

    debugDB("Current user", user);

    if (process.env.NODE_ENV === "development") {
      console.log("Prisma DB instance:", !!db);
    }

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    debugDB("Found DB user", dbUser);

    if (!dbUser) throw new Error("User not found in database");

    const roleMentor = await db.roleMentor.findFirst({
      where: {
        userId: dbUser.id,
        status: "active"
      },
      include: {
        tasks: {
          orderBy: {
            day: 'asc'
          }
        }
      }
    });

    debugDB("Found role mentor", roleMentor);
    return roleMentor;
  } catch (error) {
    console.error("Error in getRoleMentor:", error);
    debugDB("Error details", {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw new Error(error.message || "Failed to retrieve role mentor");
  }
}

export async function completeTask(taskId) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("User not authenticated");

    debugDB("Current user", user);

    if (process.env.NODE_ENV === "development") {
      console.log("Prisma DB instance:", !!db);
    }

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    debugDB("Found DB user", dbUser);

    if (!dbUser) throw new Error("User not found in database");

    const task = await db.roleTask.update({
      where: {
        id: taskId,
        roleMentor: {
          userId: dbUser.id
        }
      },
      data: {
        isCompleted: true,
        completedAt: new Date()
      }
    });

    debugDB("Updated task", task);

    const roleMentor = await db.roleMentor.findFirst({
      where: {
        userId: dbUser.id,
        status: "active"
      },
      include: {
        tasks: {
          where: {
            day: task.day
          }
        }
      }
    });

    debugDB("Found role mentor for day check", roleMentor);

    const allTasksCompleted = roleMentor.tasks.every(t => t.isCompleted);

    if (allTasksCompleted) {
      const lastDay = Math.max(...roleMentor.tasks.map(t => t.day));

      if (task.day === lastDay) {
        await db.roleMentor.update({
          where: { id: roleMentor.id },
          data: { status: "completed" }
        });
        debugDB("Marked role mentor as completed", roleMentor.id);
      } else {
        await db.roleMentor.update({
          where: { id: roleMentor.id },
          data: { currentDay: roleMentor.currentDay + 1 }
        });
        debugDB("Updated role mentor day", roleMentor.currentDay + 1);
      }
    }

    return task;
  } catch (error) {
    console.error("Error in completeTask:", error);
    debugDB("Error details", {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw new Error(error.message || "Failed to complete task");
  }
}

export async function resetRoleMentor() {
  try {
    const user = await currentUser();
    if (!user) throw new Error("User not authenticated");

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser) throw new Error("User not found in database");

    return await db.roleMentor.updateMany({
      where: {
        userId: dbUser.id,
        status: "active"
      },
      data: {
        status: "completed"
      }
    });
  } catch (error) {
    console.error("Error in resetRoleMentor:", error);
    throw new Error(error.message || "Failed to reset role mentor");
  }
}

export async function getCompletedRoleMentors() {
  try {
    const user = await currentUser();
    if (!user) throw new Error("User not authenticated");

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser) throw new Error("User not found in database");

    return await db.roleMentor.findMany({
      where: {
        userId: dbUser.id,
        status: "completed"
      },
      include: {
        tasks: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  } catch (error) {
    console.error("Error in getCompletedRoleMentors:", error);
    throw new Error(error.message || "Failed to retrieve completed role mentors");
  }
}

export async function deleteCompletedRoleMentor(roleMentorId) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("User not authenticated");

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser) throw new Error("User not found in database");

    await db.roleTask.deleteMany({
      where: {
        roleMentorId: roleMentorId
      }
    });

    await db.roleMentor.delete({
      where: {
        id: roleMentorId,
        userId: dbUser.id,
        status: "completed"
      }
    });

    return true;
  } catch (error) {
    console.error("Error in deleteCompletedRoleMentor:", error);
    throw new Error(error.message || "Failed to delete completed role mentor");
  }
}