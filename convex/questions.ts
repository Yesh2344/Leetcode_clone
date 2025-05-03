import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db
      .query("questions")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();
    return questions;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const questions = await ctx.db
      .query("questions")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();
    return questions;
  },
});

export const get = query({
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.id);
    if (!question) return null;

    // Get likes count
    const likes = await ctx.db
      .query("likes")
      .filter((q) => q.eq(q.field("questionId"), args.id))
      .collect();

    // Get comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_question", (q) => q.eq("questionId", args.id))
      .collect();

    // Get user like status
    const userId = await getAuthUserId(ctx);
    const userLike = userId
      ? await ctx.db
          .query("likes")
          .filter((q) => 
            q.and(
              q.eq(q.field("questionId"), args.id),
              q.eq(q.field("userId"), userId)
            )
          )
          .first()
      : null;

    return {
      ...question,
      likes: likes.length,
      comments,
      isLiked: !!userLike,
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    testCases: v.array(
      v.object({
        input: v.string(),
        expectedOutput: v.string(),
      })
    ),
    isPublished: v.boolean(),
    difficulty: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("questions", {
      ...args,
      authorId: userId,
      likes: 0,
      submissions: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("questions"),
    title: v.string(),
    description: v.string(),
    testCases: v.array(
      v.object({
        input: v.string(),
        expectedOutput: v.string(),
      })
    ),
    isPublished: v.boolean(),
    difficulty: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const question = await ctx.db.get(args.id);
    if (!question) throw new Error("Question not found");
    if (question.authorId !== userId) throw new Error("Not authorized");

    return await ctx.db.patch(args.id, {
      ...args,
    });
  },
});

export const toggleLike = mutation({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("likes")
      .filter((q) => 
        q.and(
          q.eq(q.field("questionId"), args.questionId),
          q.eq(q.field("userId"), userId)
        )
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.questionId, {
        likes: (await ctx.db.get(args.questionId))!.likes - 1,
      });
    } else {
      await ctx.db.insert("likes", {
        questionId: args.questionId,
        userId,
      });
      await ctx.db.patch(args.questionId, {
        likes: (await ctx.db.get(args.questionId))!.likes + 1,
      });
    }
  },
});
