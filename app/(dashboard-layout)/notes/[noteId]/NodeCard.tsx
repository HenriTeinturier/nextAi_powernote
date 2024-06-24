import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NoteType } from "../../dashboard/note.query";
import { formatDate } from "@/lib/format/date";
import { Typography } from "@/components/ui/typography";
import { Information } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export type NodeCardProps = {
  note: NoteType;
};

export const NodeCard = (props: NodeCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Note of {formatDate(props.note.date)}</CardTitle>
      </CardHeader>
      <CardContent>
        {props.note.informations.map((information) => (
          <Typography variant="base" key={information.id}>
            <b>{information.name} :</b>{" "}
            <InformationDisplay information={information} />
          </Typography>
        ))}
      </CardContent>
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
