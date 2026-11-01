import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export const getDb = () => drizzle(neon(process.env.DATABASE_URL!), { schema });
