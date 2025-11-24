import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2, Star } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("authenticated", "true");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden flex items-center justify-center">
      {/* Animated star field background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full star-animation"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

      </div>

      {/* Decorative glow elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 animate-float">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star key={i} className="w-6 h-6 text-primary star-animation" style={{ animationDelay: `${i * 0.3}s` }} />
              ))}
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 glow-golden">Akal-Akalan Quiz</h1>
          <p className="text-foreground/60 text-lg">Lebih baik pulang kami akan menang, asal jangan menangis semalam</p>
        </div>

        {/* Login Card */}
        <div className="card-glow rounded-xl p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg bg-input border border-purple-500/30 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg bg-input border border-purple-500/30 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold transition-all hover:shadow-lg hover:shadow-primary/50 flex items-center justify-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Enter the Quiz
            </button>
          </form>

          {/* Demo credentials hint
          <div className="mt-6 pt-6 border-t border-purple-500/20">
            <p className="text-center text-sm text-foreground/50 mb-3">Demo Credentials:</p>
            <p className="text-center text-xs text-foreground/40 mb-1">Email: <span className="text-primary">any@email.com</span></p>
            <p className="text-center text-xs text-foreground/40">Password: <span className="text-primary">any</span></p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
