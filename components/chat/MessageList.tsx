"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { User, Bot } from "lucide-react"
import { ChatMensagem } from "@/types/chat"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface MessageListProps {
  mensagens: ChatMensagem[]
  isTyping?: boolean
  typingText?: string
}

export function MessageList({
  mensagens,
  isTyping = false,
  typingText = "",
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll quando novas mensagens chegam
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensagens, typingText])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {mensagens.length === 0 && !isTyping && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <Bot className="w-16 h-16 mx-auto mb-4 text-geo-primary" />
            <p className="text-lg font-medium">Olá! Como posso ajudar?</p>
            <p className="text-sm mt-2">
              Faça perguntas sobre SAP, ABAP, Fiori e tecnologias relacionadas
            </p>
          </div>
        </div>
      )}

      {mensagens.map((mensagem) => (
        <MessageBubble key={mensagem.id} mensagem={mensagem} />
      ))}

      {/* Mensagem sendo digitada */}
      {isTyping && (
        <div className="flex gap-3 items-start">
          <Avatar className="w-8 h-8 bg-geo-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </Avatar>
          <Card className="flex-1 p-4 bg-gray-50 border-gray-200">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "")
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {typingText}
              </ReactMarkdown>
              <span className="inline-block w-2 h-4 bg-geo-primary animate-pulse ml-1" />
            </div>
          </Card>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

function MessageBubble({ mensagem }: { mensagem: ChatMensagem }) {
  const isUser = mensagem.role === "user"

  return (
    <div
      className={`flex gap-3 items-start ${isUser ? "flex-row-reverse" : ""}`}
    >
      <Avatar
        className={`w-8 h-8 flex items-center justify-center ${
          isUser ? "bg-geo-secondary" : "bg-geo-primary"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </Avatar>

      <Card
        className={`flex-1 p-4 ${
          isUser
            ? "bg-geo-secondary/10 border-geo-secondary/30"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        {isUser ? (
          <p className="text-gray-900 whitespace-pre-wrap">
            {mensagem.conteudo}
          </p>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "")
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-gray-800 text-gray-100 px-1.5 py-0.5 rounded text-xs"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mt-4 mb-2 text-gray-900">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mt-3 mb-2 text-gray-900">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mt-2 mb-1 text-gray-900">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="my-2 text-gray-700">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside my-2 space-y-1 text-gray-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside my-2 space-y-1 text-gray-700">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="ml-4">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-bold text-gray-900">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-700">{children}</em>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-geo-primary pl-4 italic text-gray-600 my-2">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-geo-primary hover:underline"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-gray-300">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-100">{children}</thead>
                ),
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => (
                  <tr className="border-b border-gray-300">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left font-semibold text-gray-900">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-gray-700">{children}</td>
                ),
              }}
            >
              {mensagem.conteudo_limpo || mensagem.conteudo}
            </ReactMarkdown>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-2">
          {new Date(mensagem.criado_em || "").toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </Card>
    </div>
  )
}
