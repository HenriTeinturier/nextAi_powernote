import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { NoteType } from "../../dashboard/note.query";
import { formatDate } from "@/lib/format/date";
import { Typography } from "@/components/ui/typography";
import type { Information } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export type NoteCardProps = {
  note: NoteType;
};

export const NoteCard = (props: NoteCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Note du {formatDate(props.note.date)}</CardTitle>
      </CardHeader>
      <CardContent>
        {props.note.informations.map((information) => (
          <Typography variant="base" key={information.id}>
            <b>{information.name} :</b>{" "}
            <InformationDisplay information={information} />
          </Typography>
        ))}
      </CardContent>
      <CardFooter>
        <Link
          href={`/notes/${props.note.id}/edit`}
          className={buttonVariants({ size: "sm", variant: "link" })}
        >
          Edit
        </Link>
        <Button
          variant="ghost"
          size="sm"
          // onClick={() => {
          //   enqueueDialog({
          //     title: "Delete note",
          //     description: "Are you sure you want to delete this note?",
          //     action: {
          //       label: "Delete",
          //       onClick: async () => {
          //         const { data, serverError } = await deleteNoteAction({
          //           noteId: props.note.id,
          //         });

          //         if (!data || serverError) {
          //           toast.error(serverError);
          //           return;
          //         }

          //         router.push("/dashboard");
          //       },
          //     },
          //   });
          // }}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

const InformationDisplay = ({ information }: { information: Information }) => {
  if (information.type === "BOOLEAN") {
    const data = Boolean(information.value) ? "Yes" : "No";

    return (
      <Badge variant={Boolean(information.value) ? "success" : "destructive"}>
        {data}
      </Badge>
    );
  }

  if (information.type === "NUMBER") {
    return (
      <Typography variant="code" as="span">
        {information.value}
      </Typography>
    );
  }

  return <span>{information.value}</span>;
};
