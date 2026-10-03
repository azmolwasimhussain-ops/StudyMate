import { prisma } from "../prisma";
import { DEFAULT_USER_EMAIL, DEFAULT_USER_NAME } from "@/lib/constants/config";

export async function getOrCreateDefaultUser() {
  let user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: DEFAULT_USER_EMAIL,
        name: DEFAULT_USER_NAME,
      },
    });
  }

  return user;
}
