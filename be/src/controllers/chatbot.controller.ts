import { Request, Response } from "express";
import { ChatbotService, ChatContext } from "../services/chatbot.service";
import { z } from "zod";

const ChatQueryDto = z.object({
  message: z.string().min(1),
  context: z.object({
    userGoals: z.array(z.string()).optional(),
    dietRestrictions: z.array(z.string()).optional(),
    activityLevel: z.string().optional(),
    conversationHistory: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })).optional(),
  }).optional(),
});

export const askChatbot = async (req: Request, res: Response) => {
  try {
    const validation = ChatQueryDto.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues,
      });
    }

    const { message, context: inputContext } = validation.data;

    const context: ChatContext = {
      userGoals: inputContext?.userGoals,
      dietRestrictions: inputContext?.dietRestrictions,
      activityLevel: inputContext?.activityLevel,
      conversationHistory: inputContext?.conversationHistory || [],
    };

    const response = await ChatbotService.handleChatQuery(message, context);

    res.json({
      success: true,
      data: {
        message: response,
        context,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};
