import type { Configuration, ConfigurationType } from "@prisma/client";
import type { MessagesType } from "./messages.schema";
import { openai } from "@/lib/openai";
import { getSystemNotePrompt } from "./get-system-not-prompt";

const getJsonType = (type: ConfigurationType) => {
  switch (type) {
    case "STRING":
      return "string";
    case "NUMBER":
      return "integer";
    case "BOOLEAN":
      return "boolean";
    default:
      return "string";
  }
};

export const getOpenAITool = async ({
  configurations,
  language,
  messages,
}: {
  configurations: Configuration[];
  language: string;
  messages: MessagesType;
}) => {
  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: getSystemNotePrompt({ language, configurations }),
      },
      ...messages,
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "create_note",
          description:
            "if the user provide all the informations, you can resume and create the note.",
          parameters: {
            type: "object",
            properties: configurations.reduce(
              (acc, config) => {
                const obj = {
                  type: getJsonType(config.type),
                  description: config.description ?? "-",
                } satisfies { type: string; description: string };

                return {
                  ...acc,
                  [config.name]: obj,
                };
              },
              {} as Record<string, { type: string; description: string }>,
            ),
            required: configurations.map((config) => config.name),
          },
        },
      },
      {
        type: "function",
        function: {
          name: "ask_missing_informations",
          description:
            "if the user didn't provide all the informations, you can ask for the missing informations.",
          parameters: {
            type: "object",
            properties: {
              question: {
                type: "string",
                description: "The question you ask to the user",
              },
            },
            required: ["question"],
          },
        },
      },
    ],
  });

  // console.log("result", result);

  const message = result.choices[0].message;

  // console.log("message", message);

  if (!message.tool_calls) {
    // return message;
    throw new Error("OpenAi didn't return the tool calls");
  }

  const tool = message.tool_calls[0];

  return tool.function;
};
