import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

export const create = mutation({
  args: {
    questionId: v.id("questions"),
    code: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const submissionId = await ctx.db.insert("submissions", {
      ...args,
      userId,
      status: { type: "pending" },
    });

    // Update question submission count
    const question = await ctx.db.get(args.questionId);
    if (question) {
      await ctx.db.patch(args.questionId, {
        submissions: (question.submissions || 0) + 1,
      });
    }

    // Schedule test execution
    await ctx.scheduler.runAfter(0, api.submissions.runTests, {
      submissionId,
    });

    return submissionId;
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_user_and_question", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Fetch question info for each submission
    const submissionsWithQuestions = await Promise.all(
      submissions.map(async (submission) => {
        const question = await ctx.db.get(submission.questionId);
        return {
          ...submission,
          question: question
            ? { title: question.title, difficulty: question.difficulty }
            : null,
        };
      })
    );

    return submissionsWithQuestions;
  },
});

export const get = query({
  args: { id: v.id("submissions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateStatus = internalMutation({
  args: {
    id: v.id("submissions"),
    status: v.union(
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
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateStats = internalMutation({
  args: {
    id: v.id("questions"),
    successRate: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { successRate: args.successRate });
  },
});

export const runTests = action({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.runQuery(api.submissions.get, {
      id: args.submissionId,
    });
    if (!submission) throw new Error("Submission not found");

    const question = await ctx.runQuery(api.questions.get, {
      id: submission.questionId,
    });
    if (!question) throw new Error("Question not found");

    try {
      const startTime = Date.now();
      let passedTests = 0;

      // Run each test case
      for (const testCase of question.testCases) {
        const { success, error } = await runTestCase(
          submission.code,
          testCase.input,
          testCase.expectedOutput
        );

        if (error) {
          await ctx.runMutation(internal.submissions.updateStatus, {
            id: args.submissionId,
            status: {
              type: "error",
              message: error,
            },
          });
          return;
        }

        if (success) passedTests++;
      }

      const runtime = Date.now() - startTime;

      // Update submission status
      await ctx.runMutation(internal.submissions.updateStatus, {
        id: args.submissionId,
        status: {
          type: "success",
          passedTests,
          totalTests: question.testCases.length,
          runtime,
        },
      });

      // Update question success rate
      const successRate = (passedTests / question.testCases.length);
      await ctx.runMutation(internal.submissions.updateStats, {
        id: question._id,
        successRate,
      });
    } catch (error) {
      await ctx.runMutation(internal.submissions.updateStatus, {
        id: args.submissionId,
        status: {
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  },
});

// Internal helper to run a single test case
async function runTestCase(
  code: string,
  input: string,
  expectedOutput: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create a safe evaluation context
    const vm = require("vm");
    const context = vm.createContext({
      console: {
        log: () => {},
        error: () => {},
      },
    });

    // Add the user's function to the context
    vm.runInContext(code, context);

    // Parse input and expected output
    const inputArgs = JSON.parse(input);
    const expected = JSON.parse(expectedOutput);

    // Get the function name (assuming it's the last function defined)
    const functionName = code
      .match(/function\s+([^\s(]+)/g)
      ?.pop()
      ?.split(/\s+/)[1];

    if (!functionName) {
      throw new Error("No function found in code");
    }

    // Run the function with the input
    const result = vm.runInContext(
      `${functionName}(${JSON.stringify(inputArgs)})`,
      context
    );

    // Compare the result
    return {
      success: JSON.stringify(result) === JSON.stringify(expected),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
