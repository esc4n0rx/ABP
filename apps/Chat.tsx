"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"

interface Message {
  id: string
  sender: "user" | "bot"
  text: string
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Olá! Sou seu assistente SAP. Como posso ajudá-lo hoje?",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Entendi sua pergunta. Deixe-me ajudá-lo com isso...",
      }
      setMessages((prev) => [...prev, botMessage])
    }, 500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 flex flex-col h-full"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat</h1>
        <p className="text-gray-600">Chat de suporte com assistente SAP</p>
      </div>

      <Card className="bg-white border border-gray-200 p-6 flex-1 flex flex-col shadow-sm">
        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto mb-4 max-h-96">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-geo-primary text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Digite sua mensagem..."
            className="bg-white border border-gray-300 text-gray-900"
          />
          <Button onClick={handleSend} className="bg-geo-secondary hover:bg-geo-secondary/90 text-white">
            <Send size={20} />
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
