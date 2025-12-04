import { Link, useLocation } from "react-router-dom";
import { Wand2 } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { quizAPI } from "../lib/api";

interface LayoutProps {
  children: React.ReactNode;
  authenticated?: boolean;
}

export default function Layout({ children, authenticated = false }: LayoutProps) {
  const location = useLocation();
  const { logout, user } = useAuth(); // ambil user untuk cek role
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleAdminClick = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Access denied: No token found.");
      return;
    }
    try {
      const data = await quizAPI.getAllUsers(token);
      alert("Admin Data:\n" + JSON.stringify(data, null, 2));
      console.log("Admin data:", data);
    } catch (err: any) {

      console.error("getAllUsers error:", err);
      if (err instanceof Error) {
        alert("Access denied: You are not an admin.");
      } else {
        alert("Network or server error.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">

      {/* Animated star field background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 50 }).map((_, i) => (
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

      {/* Nav */}
      <nav className="relative z-10 border-b border-purple-500/20 bg-gradient-to-r from-slate-900/80 to-purple-900/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <Wand2 className="w-6 h-6 text-primary group-hover:animate-spin transition-all" />
              <span className="text-xl font-bold glow-golden">Akal-Akalan Quiz</span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-6">
              {authenticated && (
                <>
                  {/* Dashboard */}
                  <Link
                    to="/"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      location.pathname === "/"
                        ? "text-primary glow-golden"
                        : "text-foreground/70 hover:text-foreground"
                    )}
                  >
                    Dashboard
                  </Link>

            
                  <button
                    onClick={handleAdminClick}
                    className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
                  >
                    Secret
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-foreground/70 hover:text-destructive transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </nav>

      <main className="relative z-0 pointer-events-auto">
        {children}
      </main>

      {/* Decorative elements */}
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-20 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
