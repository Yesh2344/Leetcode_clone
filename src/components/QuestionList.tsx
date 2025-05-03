import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function QuestionList({ 
  onSelectQuestion 
}: { 
  onSelectQuestion: (id: Id<"questions">) => void 
}) {
  const questions = useQuery(api.questions.list) || [];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Questions</h3>
      <div className="space-y-2">
        {questions.map((question) => (
          <button
            key={question._id}
            onClick={() => onSelectQuestion(question._id)}
            className="w-full text-left p-4 rounded-lg border border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900">{question.title}</h4>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                New
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {question.description}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {question.testCases.length} Test Cases
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Medium
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
