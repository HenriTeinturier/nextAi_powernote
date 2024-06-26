import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const formatDateAndTime = (date: Date) => {
  return format(date, "MMMM d, yyyy 'at' h:mm aa");
};

export const formatDate = (date: Date) => {
  return format(date, "d MMMM yyyy", { locale: fr });
};
