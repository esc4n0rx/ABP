"use client"

import { useAppStore } from "@/store/useAppStore"
import { useCallback, useState } from "react"
import { motion } from "framer-motion"
import { User, LogOut, Settings, Bell } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = useCallback(() => {
    logout()
    window.location.href = "/"
  }, [logout])

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-geo-primary"
        >
          Abapfy
        </motion.div>

        {/* Center */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center"
        >
          <h2 className="text-lg font-semibold text-geo-secondary">GeoSystem</h2>
        </motion.div>

        {/* Right - Icons */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-gray-600 hover:text-geo-accent transition-colors relative"
            >
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-geo-accent rounded-full" />
            </motion.button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl p-4 space-y-3"
              >
                <p className="text-gray-900 font-semibold text-sm mb-3">Notificações</p>
                {["Sistema atualizado", "Nova mensagem do suporte", "Backup realizado"].map((notif, i) => (
                  <div
                    key={i}
                    className="p-3 bg-geo-primary/5 rounded border border-geo-primary/20 text-gray-700 text-sm hover:bg-geo-primary/10 transition-colors cursor-pointer"
                  >
                    {notif}
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 text-gray-600 hover:text-geo-accent transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-geo-primary/10 flex items-center justify-center">
                <User size={16} />
              </div>
            </motion.button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200">
                  <p className="text-gray-900 font-semibold text-sm"> {user?.profile?.name || user?.email}</p>
                  <p className="text-gray-500 text-xs">Consultor SAP</p>
                </div>
                <button className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm transition-colors">
                  <User size={16} /> Perfil
                </button>
                <button className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm transition-colors border-b border-gray-200">
                  <Settings size={16} /> Configurações
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-gray-700 hover:bg-red-50 flex items-center gap-2 text-sm transition-colors"
                >
                  <LogOut size={16} /> Sair
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
