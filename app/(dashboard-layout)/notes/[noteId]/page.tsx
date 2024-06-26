import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import type { PageParams } from "@/types/next";
import { getNote } from "../../dashboard/note.query";
import { requiredAuth } from "@/lib/auth/helper";
import { NoteCard } from "./NodeCard";

export default async function RoutePage(props: PageParams<{ noteId: string }>) {
  const user = await requiredAuth();

  const note = await getNote({
    id: props.params.noteId,
    userId: user.id,
  });

  if (!note) {
    return <p>...</p>;
  }

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle></LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <NoteCard note={note} />
      </LayoutContent>
    </Layout>
  );
}
