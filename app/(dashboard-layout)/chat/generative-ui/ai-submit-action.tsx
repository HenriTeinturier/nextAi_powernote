"use server";

import { authAction } from "@/lib/server-actions/safe-actions";
import { getMutableAIState, streamUI } from "ai/rsc";
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
      },
    });

    return {
      id: Date.now().toString(),
      // role: "assistant", pas d'assistant de le UIState
      display: result.value,
    };
  },
);
