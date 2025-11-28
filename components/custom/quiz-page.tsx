"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"

interface Question {
  id?: number
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correct_answer: string
  explanation?: string
}

type QuestionResult = 'correct' | 'wrong' | 'unanswered';

const TOTAL_TIME = 1200 // 20 minutes in seconds
const QUESTION_TIME = 120 // 2 minutes per question
const QUESTIONS_PER_PAGE = 10 

export default function QuizPage(  ) {
  const [mockQuestions, setMockQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswersMap, setSelectedAnswersMap] = useState<Record<number, string>>({})
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())
  
  const [questionResultsMap, setQuestionResultsMap] = useState<Record<number, QuestionResult>>({})

  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME)
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(QUESTION_TIME)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [questionsListPage, setQuestionsListPage] = useState(1)
  const [feedbackVisible, setFeedbackVisible] = useState(false) 

  const params = useParams()
  // This extracts 'amazon' from /dashboard/quiz/amazon
  const quizName = params.topic as string | undefined

  const currentQuestion = mockQuestions[currentQuestionIndex]
  const totalQuestions = mockQuestions.length
  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)

  // Fetch questions from JSON file (unchanged)
  useEffect(() => {
    let jsonPath = '/amazon_leadership_principle_questions3.json';

    if (quizName && typeof quizName === 'string') {
      // Construct path: if quizName is 'amazon', path will be /amazon.json
      // NOTE: Ensure your JSON file is accessible in the public directory, e.g., /public/amazon.json
      jsonPath = `/${quizName.toLowerCase()}.json` 
    }

    console.log(jsonPath);

    fetch(jsonPath)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load questions: ${res.status} ${res.statusText}`)
        }
        return res.json()
      })
      .then((data: Question[]) => {
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected an array')
        }
        const questionsWithIds = data
          .filter((q) => q && q.question && q.options && q.correct_answer) 
          .map((q, index) => ({
            ...q,
            id: q.id ?? index + 1
          }))
        
        if (questionsWithIds.length === 0) {
          throw new Error('No valid questions found after filtering')
        }
        
        setMockQuestions(questionsWithIds)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error loading questions:', error)
        setIsLoading(false)
        setMockQuestions([])
      })
  }, [])

  // Timers and side effects (unchanged)
  useEffect(() => {
    if (!isTimerRunning || isLoading) return
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isTimerRunning, isLoading])

  useEffect(() => {
    if (totalQuestions > 0) {
      setQuestionTimeRemaining(QUESTION_TIME)
      setFeedbackVisible(false) 
    }
  }, [currentQuestionIndex, totalQuestions])

  useEffect(() => {
    if (totalQuestions > 0 && currentQuestionIndex >= 0) {
      const pageForCurrentQuestion = Math.floor(currentQuestionIndex / QUESTIONS_PER_PAGE) + 1
      setQuestionsListPage(pageForCurrentQuestion)
    }
  }, [currentQuestionIndex, totalQuestions])

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isSidebarOpen])

  useEffect(() => {
    if (!isTimerRunning || totalQuestions === 0 || isLoading) return

    const interval = setInterval(() => {
      setQuestionTimeRemaining((prev) => {
        if (prev <= 1) {
          if (currentQuestionIndex < totalQuestions - 1) {
            setTimeout(() => {
              setCurrentQuestionIndex((prevIdx) => prevIdx + 1)
            }, 100)
            return QUESTION_TIME
          }
          setIsTimerRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isTimerRunning, currentQuestionIndex, totalQuestions, isLoading])

  // Error/Loading states (unchanged)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-black dark:text-white mb-2">Loading quiz...</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Please wait</div>
        </div>
      </div>
    )
  }

  if (!mockQuestions.length && !isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-lg font-semibold text-black dark:text-white mb-2">No questions available</div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 text-left list-disc list-inside space-y-1 mb-4">
            <li>The file exists at /public/amazon_leadership_principle_questions3.json</li>
          </ul>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }
  
  // Answer selection function (unchanged)
  const handleAnswerSelect = (option: string) => {
    const currentQuestionId = currentQuestion?.id ?? currentQuestionIndex + 1
    const isCorrect = option === currentQuestion?.correct_answer;
    
    if (feedbackVisible) return
    
    setSelectedAnswersMap((prevMap) => ({
      ...prevMap,
      [currentQuestionId]: option,
    }))
    
    setQuestionResultsMap((prevResults) => ({
        ...prevResults,
        [currentQuestionId]: isCorrect ? 'correct' : 'wrong',
    }));

    setFeedbackVisible(true) 

    if (currentQuestion) {
      setAnsweredQuestions((prev) => new Set([...prev, currentQuestionId]))
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setFeedbackVisible(false) 
      setQuestionTimeRemaining(QUESTION_TIME)
    }
  }

  const handleQuestionClick = (index: number) => {
    if (index !== currentQuestionIndex) {
      setCurrentQuestionIndex(index)
      setFeedbackVisible(false) 
      setQuestionTimeRemaining(QUESTION_TIME)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getTimePercentage = () => {
    return (timeRemaining / TOTAL_TIME) * 100
  }

  const getQuestionTimePercentage = () => {
    return (questionTimeRemaining / QUESTION_TIME) * 100
  }

  const getPaginatedQuestions = () => {
    const startIndex = (questionsListPage - 1) * QUESTIONS_PER_PAGE
    const endIndex = startIndex + QUESTIONS_PER_PAGE 
    return mockQuestions.slice(startIndex, endIndex).map((question, relativeIndex) => ({
      question,
      absoluteIndex: startIndex + relativeIndex
    }))
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setQuestionsListPage(newPage)
    }
  }

  const handleQuestion = (question: string) => {
    let last: number = question.indexOf("]");
    let first: number = question.indexOf("(");

    return question.slice(last+1, first);
  }

  // Sidebar button classes function (unchanged)
  const getQuestionButtonClasses = (index: number, questionId: number) => {
      const result = questionResultsMap[questionId];
      const isActive = currentQuestionIndex === index;

      if (isActive) {
          return "bg-black dark:bg-white text-white dark:text-black ring-2 ring-offset-2 ring-black dark:ring-white";
      }

      if (result === 'correct') {
          return "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 hover:bg-green-300 dark:hover:bg-green-700";
      }
      
      if (result === 'wrong') {
          return "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 hover:bg-red-300 dark:hover:bg-red-700";
      }
      
      return "bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800";
  }
 
  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20 lg:pb-0">
      {/* Header (unchanged) */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white truncate flex-1">Quiz Platform</h1>
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile Timer Display */}
              <div className=" flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
                  <div className={cn(
                    "text-sm font-bold",
                    timeRemaining < 300
                      ? "text-red-500 dark:text-red-400"
                      : "text-black dark:text-white"
                  )}>
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {currentQuestionIndex + 1}/{totalQuestions}
              </div>
              {/* Mobile Sidebar Toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 text-black dark:text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-black dark:text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* ... (Breadcrumbs - unchanged) ... */}
      <div className="hidden md:block border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors">Home</span>
            <span className="text-gray-400 dark:text-gray-600">/</span>
            <span className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors">Quiz List</span>
            <span className="text-gray-400 dark:text-gray-600">/</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Quiz Content (Question, Options, Explanation) */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="space-y-4 sm:space-y-6">
              {/* Question container */}
            {getPaginatedQuestions().map(({ question, absoluteIndex }) => {
              // Only render the current question
              if (absoluteIndex !== currentQuestionIndex) return null 
              
              const questionId = question.id ?? absoluteIndex + 1
              const correctAnswer = currentQuestion?.correct_answer 
              const selectedAnswerForThisQuestion = selectedAnswersMap[questionId] || null

              return (
              <div key={questionId} className="bg-white dark:bg-black rounded-lg">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black dark:text-white mb-4 sm:mb-6 leading-tight">
                  {absoluteIndex+1}. {handleQuestion(question?.question) || "Loading question..."}
                </h2>

                {/* Answer Options (unchanged) */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {question && question.options ? (["A", "B", "C", "D"] as const).map((option) => {
                    const optionText = question.options[option] || ""
                    
                    const isSelected = selectedAnswerForThisQuestion === option; 
                    
                    const isCorrectOption = option === correctAnswer; 
                    const isWrongAndSelected = isSelected && !isCorrectOption && feedbackVisible;
                    const isRightOptionAfterSelection = isCorrectOption && feedbackVisible;
                    
                    let borderAndBgClasses = "border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:border-gray-400 dark:hover:border-gray-600";

                    if (feedbackVisible) {
                        if (isRightOptionAfterSelection) {
                            borderAndBgClasses = "border-green-500 bg-green-50 dark:bg-green-900/50 shadow-lg";
                        } else if (isWrongAndSelected) {
                            borderAndBgClasses = "border-red-500 bg-red-50 dark:bg-red-900/50 shadow-lg";
                        } else if (isSelected) {
                             borderAndBgClasses = "border-gray-500 dark:border-gray-500 bg-gray-100 dark:bg-gray-900 shadow-sm";
                        }
                    } else if (isSelected) {
                        borderAndBgClasses = "border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/50 shadow-sm";
                    }
                    
                    let circleClasses = "bg-gray-200 dark:bg-gray-800 text-black dark:text-white";
                    if (feedbackVisible) {
                        if (isRightOptionAfterSelection) {
                            circleClasses = "bg-green-500 text-white ring-2 ring-offset-2 ring-green-500";
                        } else if (isWrongAndSelected) {
                            circleClasses = "bg-red-500 text-white ring-2 ring-offset-2 ring-red-500";
                        }
                    } else if (isSelected) {
                        circleClasses = "bg-blue-500 text-white ring-2 ring-offset-2 ring-blue-500";
                    }


                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={!optionText || feedbackVisible} 
                        className={cn(
                          "w-full text-left p-3 sm:p-4 lg:p-5 rounded-lg border-2 transition-all duration-200",
                          "active:scale-[0.98] touch-manipulation",
                          "disabled:opacity-100 disabled:cursor-default",
                          !feedbackVisible && "hover:shadow-md lg:hover:scale-[1.01]",
                          borderAndBgClasses
                        )}
                      >
                        <div className="flex items-center justify-between gap-2 sm:gap-4">
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div
                              className={cn(
                                "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 transition-all",
                                circleClasses
                              )}
                            >
                              {option}
                            </div>
                            <span className="text-sm sm:text-base lg:text-lg text-black dark:text-white break-words flex-1">
                              {optionText}
                            </span>
                          </div>
                          {feedbackVisible && isCorrectOption && ( 
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                          )}
                          {feedbackVisible && isWrongAndSelected && ( 
                            <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    )
                  }) : (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading options...</div>
                  )}
                </div>
                
                {/* Explanation Display Logic (unchanged) */}
                {(() => {
                    const isUserWrong = feedbackVisible && (selectedAnswerForThisQuestion !== correctAnswer);
                    const isUserCorrect = feedbackVisible && (selectedAnswerForThisQuestion === correctAnswer);

                    if (isUserWrong && question.explanation) {
                        return (
                            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg mt-6 shadow-sm">
                                <h4 className="text-base font-semibold text-red-700 dark:text-red-300 mb-2">
                                    Why it's **Incorrect** (Review the Correct Answer):
                                </h4>
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    {question.explanation}
                                </p>
                            </div>
                        );
                    }
                    
                    if (isUserCorrect && question.explanation) {
                         return (
                            <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4 rounded-lg mt-6 shadow-sm">
                                <h4 className="text-base font-semibold text-green-700 dark:text-green-300 mb-2">
                                    Explanation for the **Correct** Answer:
                                </h4>
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    {question.explanation}
                                </p>
                            </div>
                        );
                    }

                    return null;
                })()}


                {/* ➡️ NEXT QUESTION BUTTON (FIXED LOGIC) */}
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
                    <Button 
                        onClick={handleNextQuestion} 
                        // ✅ FIX: Only disable if NO answer has been selected for this question
                        disabled={!selectedAnswerForThisQuestion} 
                        className="w-full sm:w-auto"
                    >
                        {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                </div>

              </div>)})}

               {/* Pagination (for questions list page navigation - unchanged) */}
               {/* {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                      <Button
                        onClick={() => handlePageChange(questionsListPage - 1)}
                        disabled={questionsListPage === 1}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (questionsListPage <= 3) {
                            pageNum = i + 1
                          } else if (questionsListPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = questionsListPage - 2 + i
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handleQuestionClick(pageNum - 1)}
                              className={cn(
                                "w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all",
                                questionsListPage === pageNum
                                  ? "bg-black dark:bg-white text-white dark:text-black"
                                  : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                              )}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>
                      <Button
                        onClick={() => handlePageChange(questionsListPage + 1)}
                        disabled={questionsListPage === totalPages}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs"
                      >
                        Next
                      </Button>
                    </div>
                  )} */}
                  {/* {totalPages > 1 && (
                    <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-1">
                      Page {questionsListPage} of {totalPages}
                    </div>
                  )} */}

            </div>
          </div>
          
          {/* Sidebar (Desktop) - Question Grid (unchanged) */}
          <div className="hidden lg:block order-1 lg:order-2">
             <Card className="sticky top-20 bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-black dark:text-white">
                        Desktop Quiz Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Time: <span className="font-bold">{formatTime(TOTAL_TIME)}</span><br/>
                        Time Left: <span className="font-bold">{formatTime(timeRemaining)}</span>
                    </p>
                    <div className="mt-4">
                        <h3 className="text-sm font-semibold mb-2">Question Status</h3>
                        <div className="flex flex-wrap gap-2">
                            {mockQuestions.map((q, index) => (
                                <button
                                    key={q.id || index}
                                    onClick={() => handleQuestionClick(index)}
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                                        getQuestionButtonClasses(index, q.id ?? index + 1)
                                    )}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Sidebar - Slide Over (unchanged) */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Backdrop (unchanged) */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Sidebar Content (unchanged) */}
        <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800 shadow-xl overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Close Button (unchanged) */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-black dark:text-white">Quiz Info</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-black dark:text-white" />
              </button>
            </div>

            {/* Timer Card - Mobile (unchanged) */}
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-black dark:text-white">
                  Timer Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  {/* Circular Timer (unchanged) */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="transform -rotate-90 w-24 h-24 absolute inset-0">
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        stroke="currentColor"
                        strokeWidth="5"
                        fill="none"
                        className="text-gray-200 dark:text-gray-800"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        stroke="currentColor"
                        strokeWidth="5"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - getTimePercentage() / 100)}`}
                        className={cn(
                          "transition-all duration-1000 ease-linear",
                          timeRemaining < 300
                            ? "text-red-500 dark:text-red-400"
                            : "text-black dark:text-white"
                        )}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <span className={cn(
                        "text-xl font-bold",
                        timeRemaining < 300
                          ? "text-red-500 dark:text-red-400"
                          : "text-black dark:text-white"
                      )}>
                        {formatTime(timeRemaining)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Remaining
                      </span>
                    </div>
                  </div>
                  {/* Question Timer (unchanged) */}
                  <div className="w-full">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Question Time</span>
                      <span className="text-black dark:text-white font-medium">
                        {formatTime(questionTimeRemaining)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-1000 ease-linear",
                          questionTimeRemaining < 30
                            ? "bg-red-500 dark:text-red-400"
                            : "bg-black dark:bg-white"
                        )}
                        style={{ width: `${getQuestionTimePercentage()}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Mobile Question Grid */}
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-black dark:text-white">
                        Question Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                            {mockQuestions.map((q, index) => (
                                <button
                                    key={q.id || index}
                                    onClick={() => {
                                      handleQuestionClick(index)
                                      setIsSidebarOpen(false) // Close sidebar on click
                                    }}
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                                        getQuestionButtonClasses(index, q.id ?? index + 1)
                                    )}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}