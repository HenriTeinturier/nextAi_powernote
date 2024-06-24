"use server";

import { authAction } from "@/lib/server-actions/safe-actions";
import { ConfigurationsSchema } from "./configuration.schema";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GSP_NO_RETURNED_VALUE } from "next/dist/lib/constants";

// authAction cà permet de faire des serveur action en integrant un middleware auto qui vérifie si il y a l'utilisateur. Sinon il renvoie une erreur 401
//  input est le type du schema
// context sont les donneées de la requete + les donénes de l'utilisateur (.user)
export const updateConfigurations = authAction(
  ConfigurationsSchema,
  async (input, context) => {
    // On récupère les configurations actuelles de l'utilisateur
    const currentConfigurations = await prisma.configuration.findMany({
      where: {
        userId: context.user.id,
      },
      select: {
        id: true,
      },
    });

    // console.log("je suis client ou serveur?");

    const deletedConfigurations = currentConfigurations.filter(
      (currentConfiguration) =>
        !input.some(
          (newConfiguration) => newConfiguration.id === currentConfiguration.id,
        ),
    );

    const addedConfigurations = input.filter(
      (newConfiguration) => !newConfiguration.id,
    );

    const updatedConfigurations = input.filter(
      (newConfiguration) => newConfiguration.id,
    );

    // Comme il n'y a pas async devant prisma ce n'est pas lancé immédiatement. Cela permettra d'ajouter cette promesse dans le prisma suivant et ne fait qu'un appel
    const updates = updatedConfigurations
      .map((newConfiguration) => {
        return prisma.configuration.update({
          where: {
            id: newConfiguration.id!,
          },
          data: {
            name: newConfiguration.name,
            description: newConfiguration.description,
            type: newConfiguration.type,
          },
        });
      })
      .filter(Boolean);

    // Transaction permet de faire plusieurs requettes dans le même call afin de gagner du temps.
    // On a le premier update qui retire les suppressions et ajoute les nouvelles configurations
    // Ensuite on ajoute le 2eme appel prisma l'update de celles à update que l'on avait ocnfiguré juste avant.
    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: context.user.id },
        data: {
          configurations: {
            deleteMany:
              deletedConfigurations.length > 0
                ? {
                    id: {
                      in: deletedConfigurations.map((c) => c.id),
                    },
                  }
                : undefined,
            createMany: {
              data: addedConfigurations.map((c) => ({
                name: c.name,
                description: c.description,
                type: c.type,
              })),
            },
          },
        },
        select: {
          configurations: true,
        },
      }),
      ...updates,
    ]);

    revalidatePath("/configuration");

    return user.configurations;
  },
);
