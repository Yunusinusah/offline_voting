import  { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import {
  LogOut,
  Settings,
  Users,
  Vote,
  Shield,
  Bell,
  X,
  Menu,
  ChevronDown
} from "lucide-react";
import { logout } from "../../utils/auth";

export default function SuperAdminDashboard() {
  const [elections, setElections] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navigationItems = [
    {
      id: "elections",
      label: "Election Management",
      href: "/super-admin",
      icon: Vote,
    },
    {
      id: "admins",
      label: "Admin Users",
      href: "/super-admin/admin-user-management",
      icon: Users,
    },
    {
      id: "settings",
      label: "System Settings",
      href: "/super-admin/system-settings",
      icon: Settings,
    },
  ];

  // Notification data
  const notifications = [
    {
      id: 1,
      title: "New election created",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Admin user registered",
      time: "12 minutes ago",
      read: false,
    },
    {
      id: 3,
      title: "System backup completed",
      time: "1 hour ago",
      read: true,
    },
  ];

  const unreadNotifications = notifications.filter(notification => !notification.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40 shadow-sm">
        <div className="px-5 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                className="md:hidden p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mr-2 transition-all duration-200"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center">
                <div className="p-2 bg-gradient-primary rounded-lg shadow">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900">
                  Super Admin
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2.5 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 relative transition-all duration-200"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-200/60 backdrop-blur-md">
                    <div className="px-4 py-3 border-b border-gray-200/50 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Notifications
                      </h3>
                      <button
                        onClick={() => setNotificationOpen(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close notifications"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50/80 cursor-pointer transition-colors border-b border-gray-200/30 ${
                            !notification.read ? "bg-primary-50/50" : ""
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200/50">
                      <button className="text-xs text-primary-600 hover:text-primary-700 font-medium w-full text-center py-2">
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-expanded={userDropdownOpen}
                  aria-label="User menu"
                >
                  <div className="hidden md:flex items-center space-x-2 pl-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Super Admin
                      </p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                    <div className="w-9 h-9 bg-gradient-primary rounded-full flex items-center justify-center shadow">
                      <span className="text-sm font-medium text-white">
                        SA
                      </span>
                    </div>
                  </div>
                  <div className="md:hidden w-9 h-9 bg-gradient-primary rounded-full flex items-center justify-center shadow">
                    <span className="text-sm font-medium text-white">
                      SA
                    </span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-200/60 backdrop-blur-md">
                    <div className="px-4 py-2 border-b border-gray-200/50">
                      <p className="text-sm font-medium text-gray-900">Super Admin</p>
                      <p className="text-xs text-gray-500">admin@example.com</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 transition-colors"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200/60 flex flex-col fixed h-full">
            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;

                return (
                  <NavLink
                    key={item.id}
                    to={item.href}
                    end={item.href === "/super-admin"}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-primary text-primary shadow-sm border border-primary-200"
                          : "text-gray-600 hover:text-primary-700 hover:bg-primary-50/50 border border-transparent"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <IconComponent 
                          size={18} 
                          className={`mr-3 transition-colors ${
                            isActive ? "text-primary-600" : "text-gray-400 group-hover:text-primary-500"
                          }`} 
                        />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-5 border-t border-gray-200/50 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Super Admin
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm transition-opacity md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div 
              className="fixed inset-y-0 left-0 w-full max-w-xs bg-white/95 backdrop-blur-md shadow-xl pb-12 flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 pt-6 pb-2 flex items-center justify-between border-b border-gray-200/50">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-primary rounded-lg shadow">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="ml-3 text-lg font-bold text-gray-900">
                    Super Admin
                  </h1>
                </div>
                <button
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="mt-6 px-4 space-y-1">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;

                  return (
                    <NavLink
                      key={item.id}
                      to={item.href}
                      end={item.href === "/super-admin/"}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors duration-200 ${
                          isActive
                            ? "bg-gradient-primary text-primary-700 border border-primary-200"
                            : "text-gray-600 hover:text-primary-700 hover:bg-primary-50/50 border border-transparent"
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {({ isActive }) => (
                        <>
                          <IconComponent 
                            size={18} 
                            className={`mr-3 ${isActive ? "text-primary-600" : "text-gray-400"}`} 
                          />
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
              <div className="mt-auto p-4 border-t border-gray-200/50 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Super Admin
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut size={16} className="mr-1" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1 md:ml-64">
          <div className="md:hidden bg-white/80 backdrop-blur-md shadow-sm px-4 py-3">
            <div className="flex overflow-x-auto space-x-2 py-1 hide-scrollbar">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.href}
                  end={item.href === "/super-admin/"}
                  className={({ isActive }) =>
                    `whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-primary-100 text-primary-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <main className="flex-1 pb-8 min-w-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0">
                <Outlet context={{ elections, setElections }} />
              </div>
          </main>
        </div>
      </div>

    </div>
  );
}