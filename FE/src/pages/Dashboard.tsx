import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { quizAPI } from "../lib/api";
import type { Question } from "../lib/api";

const PRIZES = [
  { place: 1, reward: "💰 Grand Prize", points: "$2,500 USD", color: "from-yellow-400 to-yellow-600" },
];

export default function Dashboard() {
  const { token } = useAuth();
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>([]);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!token) return;
        const data = await quizAPI.getQuestions(token);
        setQuestions(data);
        setSelectedAnswers(new Array(data.length).fill(null));
        setAnswered(new Array(data.length).fill(false));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [token]);

  const handleAnswer = async (optionIndex: number) => {
    const selectedOption = questions[currentQuestion]?.options[optionIndex];
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = selectedOption;
    setSelectedAnswers(newAnswers);

    const newAnswered = [...answered];
    newAnswered[currentQuestion] = true;
    setAnswered(newAnswered);

    // Submit answer to backend
    if (token && questions[currentQuestion]) {
      try {
        await quizAPI.submitAnswer(token, questions[currentQuestion].id, selectedOption);
      } catch (err) {
        console.error("Failed to submit answer:", err);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeQuiz = async () => {
    if (!token) {
      setQuizCompleted(true);
      return;
    }

    try {
      // Fetch score dari backend
      const results = await quizAPI.getMyAnswers(token);

      // Backend mengembalikan array answer dengan field score
      // Contoh: [{ score: 1 }, { score: 0 }, ...]
      const totalScore = results.reduce(
        (sum: number, ans: any) => sum + (ans.score || 0),
        0
      );

      setScore(totalScore);
    } catch (err) {
      console.error("Failed to fetch backend score:", err);

      const results = await quizAPI.getMyAnswers(token);
      const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
      setScore(totalScore);

    }

    setQuizCompleted(true);
  };


  const resetQuiz = () => {
    setShowQuiz(false);
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
    setAnswered(new Array(questions.length).fill(false));
    setQuizCompleted(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground/70 text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center">
        <div className="card-glow rounded-2xl p-8 backdrop-blur-xl text-center max-w-md">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (showQuiz) {
    if (quizCompleted) {
      return (
        <div className="min-h-screen pt-20 pb-12 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Results Card */}
            <div className="card-glow rounded-2xl p-8 backdrop-blur-xl text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary mb-6">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold glow-golden mb-2">Quiz Complete!</h1>
                <p className="text-foreground/70 text-lg">You answered {score} out of 20 points</p>

                {score === 20 && (
                  <div className="mt-6 p-6 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 border-2 border-yellow-500/50">
                    <p className="text-2xl font-bold text-yellow-400 mb-2">🎉 Congrats! 🎉</p>
                    <p className="text-lg font-semibold text-yellow-300">Kamu dapat Grand Prize!</p>
                    <p className="text-sm text-yellow-300/80 mt-3">Perfect score! Amazing job, Genius! 💰</p>
                  </div>
                )}

                {score < 20 && (
                  <div className="mt-6 p-6 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-400/10 border-2 border-blue-500/50">
                    <p className="text-2xl font-bold text-blue-400 mb-2">💪 Nice Try! 💪</p>
                    <p className="text-lg font-semibold text-blue-300">Coba lain kali!</p>
                    <p className="text-sm text-blue-300/80 mt-3">Keep practicing and you'll get the grand prize next time! 🚀</p>
                  </div>
                )}
              </div>

              {/* Score Display */}
              <div className="mb-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg blur-lg opacity-50" />
                  <div className="relative bg-card border-2 border-primary/50 rounded-lg px-12 py-6">
                    <p className="text-foreground/70 text-sm mb-1">Answers Submitted</p>
                    <p className="text-5xl font-bold glow-golden">{score}</p>
                    <p className="text-foreground/70 text-sm mt-2">out of {questions.length}</p>
                  </div>
                </div>
              </div>

              {/* Return Button */}
              <button
                onClick={resetQuiz}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/50 transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-primary">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-foreground/60">
                {answered.filter(Boolean).length} answered
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="card-glow rounded-2xl p-8 backdrop-blur-xl mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              {questions[currentQuestion]?.question}
            </h2>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {questions[currentQuestion]?.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-all text-left font-medium",
                    selectedAnswers[currentQuestion] === option
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-purple-500/30 bg-purple-500/5 text-foreground hover:border-primary/50 hover:bg-primary/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        selectedAnswers[currentQuestion] === option
                          ? "border-primary bg-primary"
                          : "border-foreground/30"
                      )}
                    >
                      {selectedAnswers[currentQuestion] === option && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-purple-500/20">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-purple-500/30 text-foreground hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === null}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {currentQuestion === questions.length - 1 ? "Complete" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <section className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="glow-golden">Welcome, People!</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Let's test your knowledge of magical tekkom lessons YAYYY!!!!!!!!!
          </p>
        </section>

        {/* Prizes Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 glow-golden">
            ✨ Grand Prize ✨
          </h2>
          <div className="flex justify-center">
            {PRIZES.map((prize) => (
              <div
                key={prize.place}
                className="max-w-md w-full rounded-2xl p-8 backdrop-blur-xl border-2 bg-gradient-to-br from-yellow-600/20 to-yellow-400/10 border-primary transform transition-all hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">💰</div>
                  <div className="text-4xl font-bold mb-4 glow-golden">{prize.reward}</div>
                  <div className="bg-card rounded-lg p-6 border border-purple-500/30 mb-6">
                    <p className="text-4xl font-bold text-primary">{prize.points}</p>
                  </div>
                  <p className="text-foreground/70 text-base">
                    Complete the quiz correctly to win!
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quiz CTA Section */}
        <section className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-xl opacity-40" />
            <div className="relative card-glow rounded-2xl p-12 backdrop-blur-xl max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold mb-4 text-foreground">
                Ready for the Challenge?
              </h3>
              <p className="text-foreground/70 mb-8 text-lg">
                Test your impressive knowledge with our question quiz. Will you claim the ultimate prize?
              </p>
              <button
                onClick={() => setShowQuiz(true)}
                className="px-12 py-4 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-lg hover:shadow-lg hover:shadow-primary/50 transition-all hover:scale-105 inline-flex items-center gap-3"
              >
                <Trophy className="w-6 h-6" />
                Start Quiz
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
