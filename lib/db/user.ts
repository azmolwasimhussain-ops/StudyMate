import { prisma } from "./prisma";

export async function getOrCreateDefaultUser() {
  const defaultEmail = "student@studymate.dev";
  let user = await prisma.user.findUnique({
    where: { email: defaultEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: defaultEmail,
        name: "Alex Rivera",
      },
    });
  }

  return user;
}
