"use client"

import { useClock } from "@/hooks/useClock"
import { useAppStore } from "@/store/useAppStore"
import { motion } from "framer-motion"

export function Footer() {
  const time = useClock()
  const user = useAppStore((state) => state.user)
  const version = useAppStore((state) => state.version)

  return (
    <footer className="bg-white/80 border-t border-gray-200 sticky bottom-0 z-30 shadow-sm">
      <div className="px-6 py-3 flex items-center justify-between text-gray-600 text-sm">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-geo-accent"
        >
          {time}
        </motion.div>
        <div className="text-center">
          <span className="text-gray-900">Abapfy</span>
          <span className="mx-2">•</span>
          <span>{version}</span>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-right"
        >
          Usuário: <span className="text-geo-secondary">{user}</span>
        </motion.div>
      </div>
    </footer>
  )
}
