import { Authenticated, Unauthenticated } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { QuestionList } from "./components/QuestionList";
import { useState } from "react";
import { QuestionEditor } from "./components/QuestionEditor";
import { AdminPanel } from "./components/AdminPanel";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const [selectedQuestionId, setSelectedQuestionId] = useState<Id<"questions"> | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            InterviewCoder
          </h2>
          <Authenticated>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAdminMode(false)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  !isAdminMode
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Practice
              </button>
              <button
                onClick={() => setIsAdminMode(true)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  isAdminMode
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Admin
              </button>
            </div>
          </Authenticated>
        </div>
        <SignOutButton />
      </header>
      
      <main className="flex-1 flex p-8">
        <div className="w-full max-w-7xl mx-auto">
          <Authenticated>
            {isAdminMode ? (
              <AdminPanel />
            ) : (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <QuestionList onSelectQuestion={setSelectedQuestionId} />
                  </div>
                </div>
                <div className="col-span-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {selectedQuestionId ? (
                      <QuestionEditor questionId={selectedQuestionId} />
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-1">
                          Select a Question
                        </h3>
                        <p className="text-gray-500">
                          Choose a coding challenge from the list to begin practicing
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Authenticated>
          <Unauthenticated>
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  Welcome to InterviewCoder
                </h1>
                <p className="text-xl text-gray-600">
                  Practice coding interviews with real-time feedback
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <SignInForm />
              </div>
            </div>
          </Unauthenticated>
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
