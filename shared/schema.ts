import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // image or video
  fileUrl: text("file_url").notNull(),
  note: text("note"),
  isFavorite: boolean("is_favorite").default(false),
  collectionId: integer("collection_id").references(() => collections.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCollectionSchema = createInsertSchema(collections).pick({
  name: true,
  description: true,
  coverImageUrl: true,
});

export const insertMediaSchema = createInsertSchema(media).pick({
  fileName: true,
  fileType: true,
  fileUrl: true,
  note: true,
  isFavorite: true,
  collectionId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof media.$inferSelect;
