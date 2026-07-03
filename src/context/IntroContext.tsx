"use client"

import { createContext, useContext, useState, useCallback } from "react"

type IntroState = {
  isExpanded: boolean
  activate: () => void
  collapse: () => void
}

const IntroContext = createContext<IntroState>({
  isExpanded: false,
  activate: () => {},
  collapse: () => {},
})

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const activate = useCallback(() => setIsExpanded(true), [])
  const collapse = useCallback(() => setIsExpanded(false), [])

  return (
    <IntroContext.Provider value={{ isExpanded, activate, collapse }}>
      {children}
    </IntroContext.Provider>
  )
}

export function useIntro() {
  return useContext(IntroContext)
}
