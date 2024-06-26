"use client";

import { useActions, useUIState } from "ai/rsc";
import type { AIChat } from "./generative-ui/ai-sdk-chat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import ChatMessage from "../notes/today/ChatMessage";
import { toast } from "sonner";

const ChatApp = () => {
  const [messages, setMessages] = useUIState<typeof AIChat>();
  const { submitUserMessageAction } = useActions<typeof AIChat>();

  const submitMutation = useMutation({
    mutationFn: async (value: string) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          display: <ChatMessage type="user" message={value} />,
        },
      ]);
      const { data, serverError } = await submitUserMessageAction({
        userInput: value,
      });

      if (!data || serverError) {
        toast.error("An error occurred while processing your request");
        return;
      }

      setMessages((prevMessages) => [...prevMessages, data]);
    },
  });

  return (
    <div>
      <div className="flex flex-1 flex-col gap-4">
        {messages.map((message) => (
          <div key={message.id}>{message.display}</div>
        ))}
      </div>
      <form
        className="mt-16 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const input = formData.get("input") as string;
          e.currentTarget.reset();
          submitMutation.mutate(input);
        }}
      >
        <Input name="input" />
        <Button type="submit" size="sm">
          <Send size="16" />
        </Button>
      </form>
    </div>
  );
};

export default ChatApp;
