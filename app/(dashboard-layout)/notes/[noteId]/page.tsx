import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import type { PageParams } from "@/types/next";
import { getNote } from "../../dashboard/note.query";
import { requiredAuth } from "@/lib/auth/helper";
import { NoteCard } from "./NoteCard";

export default async function RoutePage(props: PageParams<{ noteId: string }>) {
  const user = await requiredAuth();

  console.log("props", props);
  console.log("params", props.params);
  console.log("id", props.params.noteId);
  console.log("user", user);

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
