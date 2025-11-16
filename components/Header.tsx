"use client"

import { useAppStore } from "@/store/useAppStore"
import { useCallback, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, LogOut, Settings, Bell, X, Mail, Calendar, Wrench, Construction, Loader2 } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import toast from "react-hot-toast"
import { UserProfile } from "@/types/profile"
import { create } from "domain"

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "default",
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "default" | "large"
}) {
  if (!isOpen) return null

  const sizeClasses = {
    default: "max-w-2xl",
    large: "max-w-4xl",
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export function Header() {
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Estados para edição de perfil
  const [editingProfile, setEditingProfile] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileData, setProfileData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    role: "Consultor SAP",
    department: "",
    bio: "",
    created_at: ""
  })

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      window.location.href = "/"
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast.error("Erro ao fazer logout")
    }
  }, [logout])

  // Carrega o perfil do usuário
  const loadProfile = async () => {
    try {
      setLoadingProfile(true)
      const response = await fetch("/api/profile")
      const data = await response.json()

      if (data.success && data.data) {
        setProfile(data.data)
        setProfileData({
          name: data.data.name || "",
          email: user?.email || "",
          phone: data.data.phone || "",
          role: data.data.role || "Consultor SAP",
          department: data.data.department || "",
          bio: data.data.bio || "",
          created_at: data.data.created_at || ""
        })
      } else {
        toast.error("Erro ao carregar perfil")
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
      toast.error("Erro ao carregar perfil")
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleOpenProfile = () => {
    setShowProfileMenu(false)
    setShowProfileModal(true)
    setEditingProfile(false)
    loadProfile()
  }

  const handleOpenSettings = () => {
    setShowProfileMenu(false)
    setShowSettingsModal(true)
  }

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true)

      // Remove o email dos dados a serem enviados (não é editável)
      const { email, ...updateData } = profileData

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Perfil atualizado com sucesso!")
        setEditingProfile(false)
        setProfile(data.data)
      } else {
        toast.error(data.error || "Erro ao atualizar perfil")
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      toast.error("Erro ao atualizar perfil")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingProfile(false)
    // Restaura os dados originais do perfil carregado
    if (profile) {
      setProfileData({
        name: profile.name || "",
        email: user?.email || "",
        phone: profile.phone || "",
        role: profile.role || "Consultor SAP",
        department: profile.department || "",
        bio: profile.bio || "",
        created_at: profile.created_at || ""
      })
    }
  }

  return (
    <>
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
                    <p className="text-gray-900 font-semibold text-sm">{user?.profile?.name || user?.email}</p>
                    <p className="text-gray-500 text-xs">Consultor SAP</p>
                  </div>
                  <button
                    onClick={handleOpenProfile}
                    className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm transition-colors"
                  >
                    <User size={16} /> Perfil
                  </button>
                  <button
                    onClick={handleOpenSettings}
                    className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm transition-colors border-b border-gray-200"
                  >
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

      {/* Modal de Perfil */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Meu Perfil"
        size="large"
      >
        {loadingProfile ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-geo-primary" size={48} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Avatar e Info Principal */}
            <div className="flex items-start gap-6 pb-6 border-b">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-geo-primary to-geo-accent flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {(profileData.name || profileData.email).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {profileData.name || "Nome não definido"}
              </h3>
              <p className="text-gray-600 mb-3">{profileData.role}</p>
              <div className="flex gap-2">
                {!editingProfile ? (
                  <Button
                    onClick={() => setEditingProfile(true)}
                    className="bg-geo-primary hover:bg-geo-primary/90"
                  >
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Alterações"
                      )}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      disabled={savingProfile}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Informações do Perfil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              {editingProfile ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-geo-primary focus:border-transparent"
                  placeholder="Seu nome completo"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {profileData.name || "Não informado"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-600">
                <Mail size={16} />
                <span>{profileData.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              {editingProfile ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-geo-primary focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {profileData.phone || "Não informado"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo/Função
              </label>
              {editingProfile ? (
                <input
                  type="text"
                  value={profileData.role}
                  onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-geo-primary focus:border-transparent"
                  placeholder="Consultor SAP"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {profileData.role}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento
              </label>
              {editingProfile ? (
                <input
                  type="text"
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-geo-primary focus:border-transparent"
                  placeholder="TI, Financeiro, etc."
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {profileData.department || "Não informado"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membro desde
              </label>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-600">
                <Calendar size={16} />
                <span>
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('pt-BR', {
                        month: 'long',
                        year: 'numeric'
                      })
                    : "Data não disponível"
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biografia
            </label>
            {editingProfile ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-geo-primary focus:border-transparent min-h-[100px]"
                placeholder="Conte um pouco sobre você e sua experiência..."
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[100px]">
                {profileData.bio || "Nenhuma biografia cadastrada"}
              </p>
            )}
          </div>

          {/* Estatísticas */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Estatísticas</h4>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-geo-primary mb-1">0</p>
                <p className="text-sm text-gray-600">Códigos Gerados</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-geo-accent mb-1">0</p>
                <p className="text-sm text-gray-600">EFs Criadas</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600 mb-1">0</p>
                <p className="text-sm text-gray-600">Debugs Resolvidos</p>
              </Card>
            </div>
          </div>
        </div>
        )}
      </Modal>

      {/* Modal de Configurações */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Configurações do Sistema"
        size="large"
      >
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          {/* Animação de Construção */}
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Construction size={120} className="text-yellow-500" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-3"
          >
            <h3 className="text-2xl font-bold text-gray-900">Em Construção</h3>
            <p className="text-gray-600 max-w-md">
              Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
            </p>
          </motion.div>

          {/* Elementos decorativos animados */}
          <div className="flex gap-4 mt-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
                className="w-4 h-4 bg-geo-primary rounded-full"
              />
            ))}
          </div>

          {/* Card com prévia das futuras configurações */}
          <div className="w-full mt-8 space-y-3">
            <p className="text-sm font-semibold text-gray-700 text-center mb-4">
              Funcionalidades Planejadas:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Settings, label: "Preferências Gerais" },
                { icon: Bell, label: "Notificações" },
                { icon: Wrench, label: "Integrações" },
                { icon: User, label: "Segurança e Privacidade" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 0.5, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <item.icon size={20} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
