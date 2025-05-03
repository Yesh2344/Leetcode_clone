import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function SubmissionHistory({ questionId }: { questionId: Id<"questions"> }) {
  const submissions = useQuery(api.submissions.listByUser) || [];
  const questionSubmissions = submissions.filter(
    (s) => s.questionId === questionId
  );

  if (questionSubmissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questionSubmissions.map((submission) => (
        <div
          key={submission._id}
          className="p-4 rounded-lg border bg-gray-50"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {submission.status.type === "success" ? (
                <span className="flex items-center gap-1 text-green-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Passed {submission.status.passedTests} of{" "}
                    {submission.status.totalTests} tests
                  </span>
                </span>
              ) : submission.status.type === "error" ? (
                <span className="flex items-center gap-1 text-red-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{submission.status.message}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Running tests...</span>
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {new Date(submission._creationTime).toLocaleTimeString()}
            </span>
          </div>
          {submission.status.type === "success" && (
            <div className="text-sm text-gray-600">
              Runtime: {submission.status.runtime}ms
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
