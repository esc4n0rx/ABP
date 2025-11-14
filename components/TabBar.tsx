"use client"

import { useAppStore } from "@/store/useAppStore"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useAppStore()

  return (
    <div className="bg-white/60 border-b border-gray-200 flex items-center gap-2 px-6 py-3 overflow-x-auto">
      {/* Home Tab */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setActiveTab("home")}
        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
          activeTabId === "home"
            ? "bg-geo-primary text-white glow-accent"
            : "bg-geo-primary/10 text-gray-700 hover:bg-geo-primary/20"
        }`}
      >
        Home
      </motion.button>

      {/* App Tabs */}
      <AnimatePresence>
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
              activeTabId === tab.id
                ? "bg-geo-secondary text-white glow-accent"
                : "bg-geo-primary/10 text-gray-700 hover:bg-geo-primary/20"
            }`}
          >
            <button onClick={() => setActiveTab(tab.id)} className="flex-1">
              {tab.name}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
              className="p-1 hover:bg-red-500/30 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
