"use client"

import React, { createContext, useContext, useState } from "react"

type CognitiveMode = "CEO" | "CTO" | "CMO"

interface ExecutiveState {
  cognitiveMode: CognitiveMode
  setCognitiveMode: (mode: CognitiveMode) => void
  isFocusMode: boolean
  setFocusMode: (active: boolean) => void
}

const ExecutiveContext = createContext<ExecutiveState | undefined>(undefined)

export function ExecutiveProvider({ children }: { children: React.ReactNode }) {
  const [cognitiveMode, setCognitiveMode] = useState<CognitiveMode>("CEO")
  const [isFocusMode, setFocusMode] = useState(false)

  return (
    <ExecutiveContext.Provider value={{ cognitiveMode, setCognitiveMode, isFocusMode, setFocusMode }}>
      {children}
    </ExecutiveContext.Provider>
  )
}

export function useExecutiveState() {
  const context = useContext(ExecutiveContext)
  if (context === undefined) {
    throw new Error("useExecutiveState must be used within an ExecutiveProvider")
  }
  return context;
}
