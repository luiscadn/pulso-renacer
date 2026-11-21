import { PrismaClient } from "@prisma/client";

// Singleton: evita abrir conexiones nuevas en cada recarga de `next dev`.
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db: PrismaClient = globalParaPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalParaPrisma.prisma = db;
