"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MessagesType } from "./process-audio/messages.schema";
import { useState } from "react";
import ChatMessage from "./ChatMessage";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { processAudioAction } from "./process-audio/process-audio.action";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export type CreateNoteChatFormProps = {
  date: Date;
};

export const CreateNoteChatForm = (props: CreateNoteChatFormProps) => {
  const [messages, setMessages] = useState<MessagesType>([
    {
      content: "Hello! How can I help you today?",
      role: "assistant",
    },
  ]);

  const processCreateNoteMutation = useMutation({
    mutationFn: async ({ blob, text }: { blob?: Blob; text?: string }) => {
      // form action calling the backend
      // console.log("blob", blob);
      // console.log("text", text);

      setMessages((prevMessage) => {
        if (text) {
          return [...prevMessage, { content: text, role: "user" }];
        }

        return [
          ...prevMessage,
          { content: "Processing your audio...", role: "user" },
        ];
      });

      const formData = new FormData();

      if (blob) {
        const file = new File([blob], "audio.webm", {
          type: "audio/webm",
        });

        formData.append("audio", file);
      }

      // console.log("formData", formData);

      const { data, serverError } = await processAudioAction({
        formData,
        text,
        date: props.date,
        messages,
      });

      if (!data || serverError) {
        toast.error(serverError);
        return;
      }

      setMessages(data.messages);
    },
  });

  return (
    <Card className="p-4">
      {/* <CardHeader>
        <CardTitle>Create a new note</CardTitle>
      </CardHeader> */}
      {/* <CardContent> */}
      {/* <div> */}
      {messages.map((message, index) => (
        // <div key={index}>
        <ChatMessage
          key={index}
          type={message.role === "user" ? "user" : "assistant"}
          message={message.content}
        />
        // </div>
      ))}
      {/* </div> */}
      <ContentForm
        onSubmitAudio={(blob) => {
          processCreateNoteMutation.mutate({ blob });
        }}
        onSubmitText={(text) => {
          processCreateNoteMutation.mutate({ text });
        }}
        isPending={processCreateNoteMutation.isPending}
      />
      {/* </CardContent> */}
    </Card>
  );
};

const ContentForm = ({
  onSubmitAudio,
  onSubmitText,
  isPending,
}: {
  onSubmitAudio: (blob: Blob) => void;
  onSubmitText: (text: string) => void;
  isPending: boolean;
}) => {
  const [blob, setBlob] = useState<Blob | null>(null);
  const recorderControls = useAudioRecorder();

  return (
    <Tabs
      defaultValue="audio"
      className={cn("m-auto flex w-[400px] flex-col items-center p-4 ", {
        "animate-pulse": isPending,
      })}
    >
      <TabsList>
        <TabsTrigger value="text">Text</TabsTrigger>
        <TabsTrigger value="audio">Audio</TabsTrigger>
      </TabsList>
      <TabsContent value="text">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.target as HTMLFormElement);
            const text = formData.get("text") as string;
            onSubmitText(text);
            event.currentTarget.reset();
          }}
        >
          <Textarea name="text" placeholder="Enter your text" />
          <Button type="submit">Submit</Button>
        </form>
      </TabsContent>
      <TabsContent value="audio">
        <AudioRecorder
          onRecordingComplete={(blob) => {
            setBlob(blob);
            onSubmitAudio(blob);
          }}
          recorderControls={recorderControls}
        />
      </TabsContent>
    </Tabs>
  );
};
