import {
  Layout,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { requiredAuth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import React from "react";
import { CreateNoteChatForm } from "./CreateNoteChatForm";
import { getTodayDate } from "@/lib/note-utils/date";
import { Typography } from "@/components/ui/typography";

export default async function today() {
  const user = await requiredAuth();
  const todayDate = getTodayDate();
  const configurations = await prisma.configuration.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Edit Configuration</LayoutTitle>
        <LayoutDescription>
          The configuration define the field you want to fill daily
        </LayoutDescription>
      </LayoutHeader>
      <LayoutContent>
        <Typography variant="small">Remember, talk about</Typography>
        <ul className="my-2 ml-4 flex list-disc flex-col">
          {configurations.map((configuration) => (
            <Typography as="li" variant="muted" key={configuration.id}>
              <b>{configuration.name}</b> : {configuration.description}
            </Typography>
          ))}
        </ul>
        <CreateNoteChatForm date={todayDate} />
      </LayoutContent>
    </Layout>
  );
}
