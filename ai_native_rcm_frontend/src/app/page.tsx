"use client";

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isHovered, setIsHovered] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-ping delay-2000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto p-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Company Logo/Name */}
          <div className="text-center mb-8 animate-fadeIn">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-2 tracking-wider">
              HUMAEIN
            </h1>
            <p className="text-slate-400 text-sm tracking-widest uppercase">
              Healthcare Automation
            </p>
          </div>

          {/* Glass morphism card */}
          <Card className="backdrop-blur-xl bg-white/5 border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:bg-white/10">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-light text-white text-center tracking-wide">
                Welcome
              </CardTitle>
              <div className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 mx-auto mt-2"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
                    required
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>

                <div className="relative group">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
                    required
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 py-3 rounded-lg font-medium tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <span className="relative z-10">
                    Sign In
                  </span>
                  {isHovered && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-lg blur-sm opacity-75 -z-10"></div>
                  )}
                </Button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <span className="px-4 text-xs text-slate-400 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>

              <div className="text-center">
                <p className="text-slate-400 text-sm mb-4">
                  Don't have an account?
                </p>
                <Link 
                  href="/register" 
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 hover:from-purple-300 hover:to-cyan-300 font-medium transition-all duration-300 hover:scale-105 tracking-wide"
                >
                  Create Account →
                </Link>
              </div>

              {/* Biometric placeholder */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                    <div className="w-6 h-6 rounded-full border-2 border-purple-400 group-hover:border-cyan-400 transition-colors duration-300"></div>
                  </div>
                  <div className="text-xs text-slate-400 tracking-wider">
                    Biometric Login
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-slate-500 tracking-widest">
            © 2025 HUMAEIN. All rights reserved.
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </main>
  )