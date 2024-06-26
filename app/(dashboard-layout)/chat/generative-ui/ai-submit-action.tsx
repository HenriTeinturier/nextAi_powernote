"use server";

import { authAction } from "@/lib/server-actions/safe-actions";
import { getMutableAIState, streamUI, useUIState } from "ai/rsc";
import { z } from "zod";
import type { AIChat, AIStateType, UIStateType } from "./ai-sdk-chat";
import { openai } from "@ai-sdk/openai";
import ChatMessage from "../../notes/today/ChatMessage";
import { getDbDate } from "@/lib/note-utils/date";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format/date";
import { Loader } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { NoteCard } from "../../notes/[noteId]/NodeCard";
import { ConfigurationType } from "@prisma/client";

const ToolLoader = ({
  action,
  params,
}: {
  action: string;
  params: unknown;
}) => {
  return (
    <ChatMessage type="assistant">
      <div className="flex items-center gap-2">
        <Loader className="size-4 animate-spin" />
        <Typography variant="code" className="flex-1">
          {action}({JSON.stringify(params)})
        </Typography>
      </div>
    </ChatMessage>
  );
};

export const submitUserMessageAction = authAction(
  z.object({ userInput: z.string() }),
  async (input, context): Promise<UIStateType> => {
    // On récupère le aiState côté server.
    const aiState = getMutableAIState<typeof AIChat>();

    const systemContext = `
      Context:
      You are a Chatobt inside a daily note-taking application.

      The user comes into the application daily to record note with their voice, the AI automatically put the correct information in the configured fields.

      Goal:
      Response to the user using the tools i will provide to you.

      Response format:
      always use ${context.user.language} languages.
      Today, we are the ${formatDate(new Date())}
    `;

    const result = await streamUI({
      model: openai("gpt-4o"),
      messages: [
        { role: "system", content: systemContext },
        ...aiState.get(),
        { role: "user", content: input.userInput },
      ], // on ajoute les messages + le message de l'utilisateur
      text: ({ content, done }) => {
        if (done) {
          aiState.update((aiState) => [
            ...aiState,
            { role: "assistant", content },
          ]);
        }
        return <ChatMessage type="assistant" message={content} />;
      },
      tools: {
        get_note: {
          //nom du tools
          description: "Get a note at a specific date",
          parameters: z
            .object({
              date: z.coerce.date(),
            })
            .required(),
          generate: async function* ({ date }) {
            //en bref permet de retourner des elements petit à petit
            yield <ToolLoader action="get_note" params={{ date }} />;
            // pour tester et voir le yield pendant 5 secondes
            // await new Promise((resolve) => setTimeout(resolve, 5000));
            // pendant ce temps je vais fetch ma note
            const copyDate = getDbDate(new Date(date));
            const note = await prisma.note.findFirst({
              where: {
                date: copyDate,
                userId: context.user.id,
              },
              include: {
                informations: true,
              },
            });

            // ensuite j'affiche la note
            if (!note) {
              aiState.done([
                ...aiState.get(),
                {
                  role: "assistant",
                  content: `No note found for ${formatDate(copyDate)}`,
                },
              ]);

              return (
                <ChatMessage
                  type="assistant"
                  message={`No note found for ${formatDate(copyDate)}`}
                />
              );
            }

            return (
              <ChatMessage type="assistant">
                <NoteCard note={note} />
              </ChatMessage>
            );
          },
        },
        create_configuration: {
          description: `Create a new configuration. A configuration is a field that the user want to fill in his daily note `,
          parameters: z
            .object({
              name: z.string(),
              description: z.string(),
              type: z.nativeEnum(ConfigurationType),
            })
            .required(),
          generate: async function* ({ name, description, type }) {
            yield (
              <ToolLoader
                action="create_configuration"
                params={{ name, description, type }}
              />
            );

            const newConfiguration = await prisma.configuration.create({
              data: {
                name,
                description,
                type,
                userId: context.user.id,
              },
            });

            // Mise à jour du state afin que l'ia puisse me répondre à ce propos.
            // aiState.done([
            //   ...aiState.get(),
            //   {
            //     role: "assistant",
            //     content: `Configuration created:  ${newConfiguration.name}`,
            //   },
            // ]);

            const responseUI = await streamUI({
              model: openai("gpt-4o"),
              messages: [
                ...aiState.get(),
                {
                  role: "assistant",
                  content: `create a response to inform the user that the configurations has benn created
                  information: ${JSON.stringify(newConfiguration)}
                  response format:
                  - always use ${context.user.language} languages.
                  - Today, we are the ${formatDate(new Date())}
                  
                  Response format:
                  Je ne veu pas que tu affiches le détail. Je veux que tu faces une phrase style tu écris un SMS à un copain.
                  just write a message like a SMS. Ne met pas l'id, le type et encore moins l'userId. Juste un message texte.
                  `,
                },
              ], // on ajoute les messages + le message de l'utilisateur
              text: ({ content, done }) => {
                if (done) {
                  aiState.update((aiState) => [
                    ...aiState,
                    {
                      role: "assistant",
                      content: `content`,
                    },
                  ]);
                }
                return <ChatMessage type="assistant" message={content} />;
              },
            });

            // aiState.done([
            //   ...aiState.get(),
            //   {
            //     role: "assistant",
            //     content: responseUI.value,
            //   },
            // ]);

            return (
              <div>{responseUI.value} </div>
              // <div className="w-40 bg-red-6000">test ui</div>
              // <ChatMessage
              //   type="assistant"
              //   message={`Configuration created:  ${newConfiguration.name}`}
              // />
            );
          },
        },
      },
    });

    console.log("ai state get juste avant le retour ui", aiState.get());
    // console.log("result stream", result.stream);
    // console.log('chat', getCh())

    return {
      id: Date.now().toString(),
      // role: "assistant", pas d'assistant de le UIState
      display: result.value,
    };
  },
);
