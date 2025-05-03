import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  questions: defineTable({
    title: v.string(),
    description: v.string(),
    testCases: v.array(
      v.object({
        input: v.string(),
        expectedOutput: v.string(),
      })
    ),
    authorId: v.id("users"),
    isPublished: v.boolean(),
    difficulty: v.optional(v.string()),
    category: v.optional(v.string()),
    likes: v.optional(v.number()),
    submissions: v.optional(v.number()),
    successRate: v.optional(v.number()),
  }).index("by_author", ["authorId"]),

  submissions: defineTable({
    questionId: v.id("questions"),
    userId: v.id("users"),
    code: v.string(),
    language: v.string(),
    status: v.union(
      v.object({
        type: v.literal("pending"),
      }),
      v.object({
        type: v.literal("success"),
        passedTests: v.number(),
        totalTests: v.number(),
        runtime: v.number(),
      }),
      v.object({
        type: v.literal("error"),
        message: v.string(),
      })
    ),
    executionTime: v.optional(v.number()),
  }).index("by_user_and_question", ["userId", "questionId"]),

  comments: defineTable({
    questionId: v.id("questions"),
    userId: v.id("users"),
    content: v.string(),
    likes: v.optional(v.number()),
  }).index("by_question", ["questionId"]),

  likes: defineTable({
    questionId: v.id("questions"),
    userId: v.id("users"),
  }).index("by_user_and_question", ["userId", "questionId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
