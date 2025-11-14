import { create } from "zustand"

export interface Tab {
  id: string
  name: string
  appId: string
}

interface AppStoreState {
  user: string | null
  isLoggedIn: boolean
  tabs: Tab[]
  activeTabId: string | "home"
  notifications: string[]
  theme: "light" | "dark"
  version: string

  // Actions
  setUser: (user: string) => void
  logout: () => void
  openTab: (appId: string, appName: string) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string | "home") => void
  addNotification: (notification: string) => void
  removeNotification: (index: number) => void
  setTheme: (theme: "light" | "dark") => void
}

export const useAppStore = create<AppStoreState>((set) => ({
  user: null,
  isLoggedIn: false,
  tabs: [],
  activeTabId: "home",
  notifications: ["Sistema atualizado com sucesso", "Nova mensagem do suporte", "Backup realizado"],
  theme: "light",
  version: "v1.0.0",

  setUser: (user) => set({ user, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false, tabs: [], activeTabId: "home" }),

  openTab: (appId, appName) =>
    set((state) => {
      const tabId = `${appId}-${Date.now()}`
      return {
        tabs: [...state.tabs, { id: tabId, name: appName, appId }],
        activeTabId: tabId,
      }
    }),

  closeTab: (tabId) =>
    set((state) => {
      const newTabs = state.tabs.filter((tab) => tab.id !== tabId)
      return {
        tabs: newTabs,
        activeTabId: newTabs.length > 0 ? newTabs[newTabs.length - 1].id : "home",
      }
    }),

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),

  removeNotification: (index) =>
    set((state) => ({
      notifications: state.notifications.filter((_, i) => i !== index),
    })),

  setTheme: (theme) => set({ theme }),
}))
