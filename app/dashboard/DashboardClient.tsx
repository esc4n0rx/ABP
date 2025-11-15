"use client"

import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { TabBar } from "@/components/TabBar"
import { AbapDeveloper } from "@/apps/AbapDeveloper"
import { CriacaoEF } from "@/apps/CriacaoEF"
import { DebugCodigo } from "@/apps/DebugCodigo"
import { Chat } from "@/apps/Chat"
import { AppCard } from "@/components/AppCard"
import { APPS } from "@/lib/constants"
import { motion } from "framer-motion"
import { Toaster } from "react-hot-toast"

export default function DashboardClient() {
  const router = useRouter()
  const { activeTabId, tabs } = useAppStore()

  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  const renderAppContent = () => {
    if (activeTabId === "home") {
      return <HomeContent />
    }

    if (activeTab?.appId === "abap-developer") return <AbapDeveloper />
    if (activeTab?.appId === "criacao-ef") return <CriacaoEF />
    if (activeTab?.appId === "debug-codigo") return <DebugCodigo />
    if (activeTab?.appId === "chat") return <Chat />

    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <Toaster position="top-right" />
      <Header />
      <TabBar />
      <main className="flex-1 px-6 py-8 overflow-y-auto">{renderAppContent()}</main>
      <Footer />
    </div>
  )
}

function HomeContent() {
  const { openTab } = useAppStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Bem-vindo ao Abapfy</h1>
        <p className="text-sm text-gray-600">Plataforma de Ferramentas Do Mundo SAP</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {APPS.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <AppCard app={app} onOpen={() => openTab(app.id, app.name)} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
