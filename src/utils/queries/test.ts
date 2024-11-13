import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getTest() {
  const data = await prisma.test.findFirst();
  if (!data) {
    console.log("No data found");
  }
  return data;
}
