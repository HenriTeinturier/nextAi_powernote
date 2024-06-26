import { createAI } from "ai/rsc";
import { submitUserMessageAction } from "./ai-submit-action";
import ChatMessage from "../../notes/today/ChatMessage";
import React from "react";

export type AIStateType = {
  role: "user" | "assistant" | "system";
  content: string;
  id?: string;
  name?: string;
};

export type UIStateType = {
  id: string;
  display: React.ReactNode;
};

// c'est la discussion avec openaI. Doit donc être à jour avec le uistate
// donc on lui ajoute le message de depart que l'on a ajouté dans uiState
const initialAIState: AIStateType[] = [
  {
    id: Date.now().toString(),
    role: "assistant",
    content: "Hello! How can I help you today?",
  },
];

const initialUIState: UIStateType[] = [
  {
    id: Date.now().toString(),
    display: (
      <ChatMessage
        type="assistant"
        message="Hello! How can I help you today?"
      />
    ),
  },
];

export const AIChat = createAI({
  actions: {
    submitUserMessageAction,
  },
  initialUIState: initialUIState,
  initialAIState: initialAIState,
});
