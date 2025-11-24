import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "../lib/utils";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

const DEFAULT_QUIZZES: QuizQuestion[] = [
  {
    id: 1,
    question: "Dalam konteks Sistem Waktu Diskrit, apa syarat mutlak agar sebuah sistem Linear Time-Invariant atau LTI dikatakan stabil secara BIBO jika dilihat dari Region of Convergence atau ROC pada Transformasi Z?",
    options: ["Wilayah konvergensi atau ROC harus mencakup lingkaran satuan pada bidang kompleks.", "Wilayah konvergensi harus meluas ke luar menjauhi titik pusat hingga tak hingga.", "Semua pole atau kutub sistem harus berada tepat di sumbu imajiner vertikal", "Sistem harus memiliki jumlah pole yang lebih sedikit daripada jumlah zero."],
    correct: 0,
  },
  {
    id: 2,
    question: "Anda memiliki sebuah matriks real sembarang, lalu Anda mengalikannya dengan transpos dari matriks itu sendiri (Matriks Transpos dikali Matriks Asli), sifat apa yang PASTI dimiliki oleh nilai-nilai eigen dari matriks hasil perkalian tersebut?",
    options: ["Nilai eigennya pasti sama persis dengan nilai singular dari matriks aslinya", "Semua nilai eigen pasti berupa bilangan real yang tidak negatif (nol atau positif).", "Semua nilai eigen pasti berupa bilangan imajiner murni.", "Nilai eigennya pasti saling berkebalikan satu sama lain."],
    correct: 1,
  },
  {
    id: 3,
    question: "Tahun berapa Teknik Komputer UI didirikan",
    options: ["1987", "1986", "2004", "2006"],
    correct: 3,
  },
];

export default function Admin() {
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>(DEFAULT_QUIZZES);
  const [expandedId, setExpandedId] = useState<number | null>(null);


  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-2 glow-golden">🔐 Quiz Answer 🔐</h1>
        </div>

        {/* Quiz List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Questions ({quizzes.length})
          </h2>

          {quizzes.length === 0 ? (
            <div className="card-glow rounded-2xl p-12 backdrop-blur-xl text-center">
              <p className="text-foreground/60">No questions yet. Add one above to get started!</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className={cn(
                  "card-glow rounded-xl backdrop-blur-xl overflow-hidden transition-all",
                  expandedId === quiz.id ? "" : ""
                )}
              >
                {/* Summary Row */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === quiz.id ? null : quiz.id)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-purple-500/10 transition-all"
                >
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground line-clamp-2">
                      {quiz.question}
                    </p>
                    <p className="text-sm text-foreground/60 mt-1">
                      {quiz.options.length} options • Correct: Option {quiz.correct + 1}
                    </p>
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedId === quiz.id && (
                  <div className="border-t border-purple-500/20 px-6 py-6 bg-purple-500/5">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-primary mb-2">
                          Question
                        </p>
                        <p className="text-foreground">{quiz.question}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-primary mb-3">
                          Answer Options
                        </p>
                        <div className="space-y-2">
                          {quiz.options.map((option, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "p-3 rounded-lg border-2 flex items-center gap-3",
                                idx === quiz.correct
                                  ? "border-emerald-500/50 bg-emerald-500/10"
                                  : "border-purple-500/20 bg-purple-500/5"
                              )}
                            >
                              {idx === quiz.correct ? (
                                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <X className="w-5 h-5 text-foreground/40 flex-shrink-0" />
                              )}
                              <span className="text-foreground">
                                {option}
                              </span>
                              {idx === quiz.correct && (
                                <span className="ml-auto text-xs font-semibold text-emerald-400">
                                  CORRECT
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
