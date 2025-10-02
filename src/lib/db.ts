import { PrismaClient } from "@/generated/prisma";

console.log("PrismaClient imported:", PrismaClient); // Debug

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}