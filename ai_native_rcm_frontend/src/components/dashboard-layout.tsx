"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, User, FileText, Settings, Menu, ListChecks, ScanFace, ClipboardPlus, Sparkles, Binary, HandCoins, RefreshCcwDot, Circle, CircleX, DollarSign, PenTool} from "lucide-react"
import { useState } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navigationItems = [
    { href: "/dashboard", icon: Home, label: "Overview", enabled: true },
    { href: "/dashboard/workflows", icon: FileText, label: "Workflow Runs", enabled: true },
    { href: "/dashboard/eligibility_checks", icon: ListChecks, label: "Eligibility Checks", enabled: true },
    { href: "/dashboard/clinical_documents", icon: ClipboardPlus, label: "Clinical Documents", enabled: true },
    { href: "/dashboard/prior_auths", icon: ScanFace, label: "Prior Auths", enabled: true },
    { href: "/dashboard/coded_encounters", icon: Binary, label: "Coded Encounters", enabled: true },
    { href: "/dashboard/scrubbed_claims", icon: Sparkles, label: "Scrubbed Claims", enabled: true },
    { href: "/dashboard/claims", icon: HandCoins, label: "Claims", enabled: true },
    { href: "#", icon: CircleX, label: "Denials", enabled: false },
    { href: "#", icon: RefreshCcwDot, label: "Resubmissions", enabled: false },
    { href: "#", icon: DollarSign, label: "Payment", enabled: false },
    { href: "#", icon: PenTool, label: "Reconciliations", enabled: false },
    { href: "/dashboard/profile", icon: User, label: "Profile", enabled: true },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-white/5  via-white to-slate-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-72'} transition-all duration-300 relative z-10`}>
        <div className="h-full backdrop-blur-xl bg-white/5 border-r border-white/10 shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 tracking-wider">
                  HUMAEIN
                </h1>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-slate-700 hover:text-gray-600 hover:bg-white/10 transition-all duration-200"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            {!sidebarCollapsed && (
              <p className="text-xs text-slate-400 tracking-widest uppercase mt-2">
                Healthcare Automation
              </p>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="mt-6 px-4">
            <div className="space-y-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon
                const isHovered = hoveredItem === item.label
                
                if (item.enabled) {
                  return (
                    <Link key={item.label} href={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'} text-left relative group transition-all duration-300 hover:bg-white/10 text-slate-700 hover:text-slate-600 border-0 h-12 rounded-xl overflow-hidden ${isHovered ? 'bg-white/10 scale-105' : ''}`}
                        onMouseEnter={() => setHoveredItem(item.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        {/* Gradient background on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}></div>
                        
                        <Icon className={`h-5 w-5 relative z-10 ${sidebarCollapsed ? '' : 'mr-4'} group-hover:text-cyan-400 transition-colors duration-200`} />
                        {!sidebarCollapsed && (
                          <span className="relative z-10 font-medium tracking-wide">
                            {item.label}
                          </span>
                        )}
                        
                        {/* Hover glow effect */}
                        {isHovered && !sidebarCollapsed && (
                          <div className="absolute right-4 w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse"></div>
                        )}
                      </Button>
                    </Link>
                  )
                } else {
                  return (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'} text-left opacity-40 cursor-not-allowed text-slate-700 h-12 rounded-xl`}
                      disabled
                    >
                      <Icon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-4'}`} />
                      {!sidebarCollapsed && (
                        <span className="font-medium tracking-wide">
                          {item.label}
                        </span>
                      )}
                    </Button>
                  )
                }
              })}
            </div>
          </nav>

          {/* Bottom section */}
          <div className="absolute bottom-6 left-4 right-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              {!sidebarCollapsed && (
                <>
                  <div className="text-xs text-slate-400 mb-2 tracking-widest uppercase">
                    System Status
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-700">All Systems Online</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        {/* Top bar with glassmorphism */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-slate-800 text-smtracking-wide">
              Dashboard
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-8">
          <div className="backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 shadow-2xl min-h-full p-6">
            {children}
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/2 right-8 transform -translate-y-1/2 pointer-events-none">
        <div className="w-1 h-32 bg-gradient-to-b from-transparent via-purple-400/20 to-transparent rounded-full animate-pulse"></div>
      </div>

      <style jsx>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.3);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.5);
        }
      `}</style>
    </div>
  )
}