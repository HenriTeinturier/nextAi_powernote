import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { ClientMarkdown } from "@/features/markdown/ClientMarkdown";
import { Bot, User2 } from "lucide-react";

export type ChatMessageProps = {
  type: "user" | "assistant";
  message?: string;
  children?: React.ReactNode;
};

export default function ChatMessage(props: ChatMessageProps) {
  return props.children ? (
    <div>{props.children}</div>
  ) : (
    <div>
      <Typography variant="small" className="inline-flex items-center gap-1">
        {props.type === "user" ? (
          <>
            <User2 size="12" /> You
          </>
        ) : (
          <>
            <Bot size="12" /> Assistant
          </>
        )}
      </Typography>
      {props.message ? (
        <ClientMarkdown className="prose-sm">{props.message}</ClientMarkdown>
      ) : (
        <Skeleton className=" h-4 w-1/2" />
      )}
    </div>
  );
}
