import { auth } from "../auth/helper";
import { prisma } from "../prisma";

export const getPremiumLimitation = async () => {
  const user = await auth();

  if (!user) {
    return {
      maxNotes: 0,
      remainingNotes: 0,
      percentUsed: 100,
    };
  }

  if (user.plan === "PREMIUM")
    return { maxNotes: Infinity, remainingNotes: Infinity, percentUsed: 0 };

  const totalNotes = await prisma.note.count({
    where: {
      userId: user.id,
    },
  });

  //TODO remettre à 10 le remaining notes
  return {
    maxNotes: 10,
    remainingNotes: 1 - totalNotes,
    percentUsed: (totalNotes / 10) * 100,
  };
};
