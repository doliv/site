import { pgTable, serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("pending"), // "pending" | "approved"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const meetups = pgTable("meetups", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  location: text("location").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  capacity: integer("capacity").notNull().default(20),
});

export const registrations = pgTable(
  "registrations",
  {
    id: serial("id").primaryKey(),
    meetupId: integer("meetup_id").notNull().references(() => meetups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.meetupId, t.email)],
);

// Pages fixes du site, modifiables depuis l'administration.
// Pas de ligne = on affiche le texte d'origine (src/content/…).
export const pages = pgTable("pages", {
  slug: text("slug").primaryKey(),
  body: text("body").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
