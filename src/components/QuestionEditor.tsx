import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Editor from "@monaco-editor/react";
import { useState } from "react";
import { toast } from "sonner";
import { SubmissionHistory } from "./SubmissionHistory";
import { Comments } from "./Comments";

export function QuestionEditor({ questionId }: { questionId: Id<"questions"> }) {
  const question = useQuery(api.questions.get, { id: questionId });
  const submit = useMutation(api.submissions.create);
  const toggleLike = useMutation(api.questions.toggleLike);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!question) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const difficultyColor = {
    Easy: "text-green-600 bg-green-100",
    Medium: "text-yellow-600 bg-yellow-100",
    Hard: "text-red-600 bg-red-100",
  }[question.difficulty || "Medium"];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {question.title}
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <span className={`px-2 py-1 rounded-full ${difficultyColor}`}>
                {question.difficulty}
              </span>
              <span className="text-gray-500">{question.category}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleLike({ questionId })}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
                question.isLiked
                  ? "bg-pink-100 text-pink-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={question.isLiked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{question.likes}</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {((question.successRate || 0) * 100).toFixed(1)}% Success Rate
              </span>
            </div>
          </div>
        </div>
        <p className="text-gray-600 whitespace-pre-wrap">{question.description}</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Test Cases:</h4>
        <div className="space-y-2">
          {question.testCases.map((testCase, index) => (
            <div key={index} className="flex gap-4 text-sm">
              <div className="flex-1">
                <span className="text-gray-500">Input:</span>
                <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-gray-800">
                  {testCase.input}
                </code>
              </div>
              <div className="flex-1">
                <span className="text-gray-500">Expected:</span>
                <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-gray-800">
                  {testCase.expectedOutput}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Solution.js</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCode("")}
              className="text-gray-400 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div className="h-[400px]">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Write your solution and click Submit to test</span>
        </div>
        <button
          onClick={async () => {
            if (!code.trim()) {
              toast.error("Please write some code before submitting");
              return;
            }
            setIsSubmitting(true);
            try {
              await submit({
                questionId,
                code,
                language: "javascript",
              });
              toast.success("Solution submitted successfully!");
            } catch (error) {
              toast.error("Failed to submit solution");
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
            isSubmitting
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 active:transform active:scale-95"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            "Submit Solution"
          )}
        </button>
      </div>

      <div className="border-t pt-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Submissions</h3>
            <SubmissionHistory questionId={questionId} />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Discussion</h3>
            <Comments questionId={questionId} />
          </div>
        </div>
      </div>
    </div>
  );
}
