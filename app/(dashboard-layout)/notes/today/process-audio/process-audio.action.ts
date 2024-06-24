"use server";

import { authAction } from "@/lib/server-actions/safe-actions";
import { ProcessAudioSchema } from "./process-audio.schema";
import { getParamsText } from "./get-params-text";
import { getOpenAITool } from "./get-openai-choice";
import { prisma } from "@/lib/prisma";

export const processAudioAction = authAction(
  ProcessAudioSchema,
  async (input, context) => {
    const textFormUser = await getParamsText(input);

    const newMessages = [...(input.messages ?? [])];
    newMessages.push({ content: textFormUser, role: "user" });

    const configurations = await prisma.configuration.findMany({
      where: {
        userId: context.user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const tool = await getOpenAITool({
      configurations,
      language: context.user.language,
      messages: newMessages,
    });

    const args = JSON.parse(tool.arguments);

    if (tool.name === "create_note") {
      const createdNote = await prisma.note.create({
        data: {
          date: input.date,
          userId: context.user.id,
          informations: {
            createMany: {
              data: Object.keys(args).map((name) => {
                return {
                  name,
                  value: String(args[name]),
                  type:
                    configurations.find((c) => c.name === name)?.type ??
                    "STRING",
                };
              }),
            },
          },
        },
        include: {
          informations: true,
        },
      });

      newMessages.push({
        role: "assistant",
        content: `New note :
        
${createdNote.informations.map((i) => `* ${i.name} : ${i.value}`).join("\n")}`,
      });

      return {
        type: "create_note",
        messages: newMessages,
      };
    }

    if (tool.name === "ask_missing_informations") {
      newMessages.push({
        content: args.question,
        role: "assistant",
      });

      return {
        type: "ask_missing_informations",
        messages: newMessages,
      };
    }
  },
);
