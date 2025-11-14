"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, Zap, Bug, MessageCircle, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"

interface AppCardProps {
  app: {
    id: string
    name: string
    description: string
    version?: string
    icon: string
  }
  onOpen: () => void
}

export function AppCard({ app, onOpen }: AppCardProps) {
  const icons: Record<string, React.ReactNode> = {
    code: <Code size={24} />,
    zap: <Zap size={24} />,
    bug: <Bug size={24} />,
    "message-circle": <MessageCircle size={24} />,
  }

  const handleOpen = () => {
    onOpen()
    toast.success(`App ${app.name} aberto com sucesso!`)
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="bg-white border border-gray-200 hover:border-geo-primary/50 p-6 h-full flex flex-col justify-between group transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer">
        <div className="flex items-start gap-4 mb-3 flex-1">
          {/* Icon */}
          <div className="w-12 h-12 rounded-lg bg-geo-primary/10 flex items-center justify-center text-geo-primary flex-shrink-0 group-hover:text-geo-accent group-hover:bg-geo-primary/20 transition-all duration-300">
            {icons[app.icon] || <Code size={24} />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-base font-semibold text-gray-900 truncate">{app.name}</h3>
              {app.version && (
                <span className="text-xs bg-geo-primary/10 text-geo-primary px-2 py-1 rounded flex-shrink-0 font-medium">
                  {app.version}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{app.description}</p>
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
          <Button
            onClick={handleOpen}
            size="sm"
            className="bg-geo-primary hover:bg-geo-accent text-white transition-all duration-300 flex items-center gap-2"
            title="Abrir app"
          >
            Abrir
            <ArrowRight size={16} />
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
