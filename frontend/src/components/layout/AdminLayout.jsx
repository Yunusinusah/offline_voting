"use client"

import { useState, useEffect } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { 
  LogOut, 
  Clock, 
  Settings, 
  Users, 
  UserCheck, 
  BarChart3, 
  Monitor, 
  Printer,
  Shield,
  Bell,
  ChevronDown,
  X,
  Menu
} from "lucide-react"
import { logout } from "../../utils/auth"

export default function AdminDashboard() {
  const [timeWarning, setTimeWarning] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  }

  // Simulate time warning for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeWarning(true)
    }, 2000) // Show warning after 2 seconds for demo
    return () => clearTimeout(timer)
  }, [])

  const navItems = [
    { id: "elections", label: "Election Config", href: "/admin", icon: Settings },
    { id: "voters", label: "Voter Management", href: "/admin/voter-management", icon: Users },
    { id: "agents", label: "Polling Agents", href: "/admin/polling-agents-management", icon: UserCheck },
    { id: "time", label: "Time Adjustment", href: "/admin/time-adjustment", icon: Clock },
    { id: "monitoring", label: "Live Monitoring", href: "/admin/live-monitoring", icon: Monitor },
    { id: "results", label: "Results & Printing", href: "/admin/results-and-printing", icon: Printer },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
          {/* Logo/Site Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <NavLink
                  key={item.id}
                  to={item.href}
                  className={({ isActive }) => 
                    `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`
                  }
                  end={item.href === "/admin"}
                >
                  <IconComponent size={18} className="mr-3" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          
          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-md text-lg hover:bg-gray-100 transition-colors d-full"
              >
                <LogOut size={16} className="mr-1" />
                Logout
              </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 md:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button 
                  className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none mr-2"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu size={20} />
                </button>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full flex items-center md:hidden">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
                  Online
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button 
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none relative"
                  >
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  
                  {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                        <button onClick={() => setNotificationOpen(false)} className="text-gray-400 hover:text-gray-500">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm font-medium text-gray-900">New voter registration</p>
                          <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm font-medium text-gray-900">Polling agent assigned</p>
                          <p className="text-xs text-gray-500 mt-1">12 minutes ago</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome, Admin</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 transition-colors"
                  >
                    <LogOut size={16} className="mr-1" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Time Warning Banner */}
        {timeWarning && (
          <div className="bg-amber-100 border-b border-amber-200 text-amber-800 px-4 py-2.5">
            <div className="max-w-7xl mx-auto flex items-center">
              <Clock size={18} className="mr-2 flex-shrink-0" />
              <span className="text-sm">Election will end in 30 minutes. Please prepare for closing procedures.</span>
              <button 
                onClick={() => setTimeWarning(false)}
                className="ml-auto text-amber-700 hover:text-amber-900"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-75 transition-opacity md:hidden">
            <div className="fixed inset-0 flex z-50">
              <div className="relative w-full max-w-xs bg-white shadow-xl pb-12 flex flex-col overflow-y-auto">
                <div className="px-4 pt-5 pb-6 flex items-center justify-between border-b border-gray-200">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-indigo-600" />
                    <h1 className="ml-2 text-xl font-semibold text-gray-900">Admin Panel</h1>
                  </div>
                  <button 
                    className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
                <nav className="mt-6 px-4 space-y-1">
                  {navItems.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <NavLink
                        key={item.id}
                        to={item.href}
                        className={({ isActive }) => 
                          `flex items-center px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`
                        }
                        onClick={() => setMobileMenuOpen(false)}
                        end={item.href === "/admin"}
                      >
                        <IconComponent size={18} className="mr-3" />
                        {item.label}
                      </NavLink>
                    )
                  })}
                </nav>
                <div className="mt-auto px-4 py-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Welcome, Admin</span>
                    <button
                      onClick={handleLogout}
                      className="ml-auto flex items-center text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 transition-colors"
                    >
                      <LogOut size={16} className="mr-1" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}