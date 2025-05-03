import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

type TestCase = {
  input: string;
  expectedOutput: string;
};

export function AdminPanel() {
  const questions = useQuery(api.questions.listAll) || [];
  const createQuestion = useMutation(api.questions.create);
  const updateQuestion = useMutation(api.questions.update);
  const [selectedQuestion, setSelectedQuestion] = useState<{
    _id: Id<"questions">;
    title: string;
    description: string;
    testCases: TestCase[];
    isPublished: boolean;
    difficulty: string;
    category: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    testCases: [{ input: "", expectedOutput: "" }],
    isPublished: false,
    difficulty: "Medium",
    category: "Arrays",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      testCases: [{ input: "", expectedOutput: "" }],
      isPublished: false,
      difficulty: "Medium",
      category: "Arrays",
    });
    setSelectedQuestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedQuestion) {
        await updateQuestion({
          id: selectedQuestion._id,
          ...formData,
        });
        toast.success("Question updated successfully!");
      } else {
        await createQuestion(formData);
        toast.success("Question created successfully!");
      }
      resetForm();
    } catch (error) {
      toast.error("Failed to save question");
    }
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: "", expectedOutput: "" }],
    });
  };

  const removeTestCase = (index: number) => {
    setFormData({
      ...formData,
      testCases: formData.testCases.filter((_, i) => i !== index),
    });
  };

  const difficulties = ["Easy", "Medium", "Hard"];
  const categories = [
    "Arrays",
    "Strings",
    "Linked Lists",
    "Trees",
    "Graphs",
    "Dynamic Programming",
    "Math",
    "Other",
  ];

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 active:transform active:scale-95"
            >
              New Question
            </button>
          </div>
          <div className="space-y-3">
            {questions.map((question) => (
              <button
                key={question._id}
                onClick={() => {
                  setSelectedQuestion(question);
                  setFormData({
                    title: question.title,
                    description: question.description,
                    testCases: question.testCases,
                    isPublished: question.isPublished,
                    difficulty: question.difficulty || "Medium",
                    category: question.category || "Arrays",
                  });
                }}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                  selectedQuestion?._id === question._id
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-gray-50 border-transparent"
                } border`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">{question.title}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      question.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {question.isPublished ? "Published" : "Draft"}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {question.difficulty || "Medium"}
                  </span>
                </div>
              </button>
            ))}
            {questions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">No questions yet</p>
                <p className="text-xs mt-1">Create your first question to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="col-span-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {selectedQuestion ? "Edit Question" : "New Question"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="e.g., Two Sum"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="Describe the problem and any constraints..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Test Cases
                </label>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  + Add Test Case
                </button>
              </div>
              <div className="space-y-4">
                {formData.testCases.map((testCase, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-gray-50 relative group"
                  >
                    {formData.testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Input
                        </label>
                        <input
                          type="text"
                          value={testCase.input}
                          onChange={(e) => {
                            const newTestCases = [...formData.testCases];
                            newTestCases[index].input = e.target.value;
                            setFormData({ ...formData, testCases: newTestCases });
                          }}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                          placeholder="e.g., [2, 7, 11, 15], 9"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expected Output
                        </label>
                        <input
                          type="text"
                          value={testCase.expectedOutput}
                          onChange={(e) => {
                            const newTestCases = [...formData.testCases];
                            newTestCases[index].expectedOutput = e.target.value;
                            setFormData({ ...formData, testCases: newTestCases });
                          }}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                          placeholder="e.g., [0, 1]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Publish question
                </span>
              </label>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 active:transform active:scale-95"
                >
                  {selectedQuestion ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
