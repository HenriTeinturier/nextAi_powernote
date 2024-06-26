import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import type { PageParams } from "@/types/next";
import { AIChat } from "./generative-ui/ai-sdk-chat";
import ChatApp from "./ChatApp";

export default async function RoutePage(props: PageParams<{}>) {
  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Chat</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <AIChat>
          <ChatApp />
        </AIChat>
      </LayoutContent>
    </Layout>
  );
}
