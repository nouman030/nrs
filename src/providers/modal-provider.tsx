'use client'

import { TicketDetails } from '@/lib/types'
import { Agency, Contact, Plan, User } from '@prisma/client'
import { createContext, useContext, useEffect, useState } from 'react'

interface ModalProviderProps {
  children: React.ReactNode
}

export type ModalData = {
  user?: User
  agency?: Agency
  ticket?: TicketDetails[0]
  contact?: Contact
}

type ModalContextType = {
  data: ModalData
  isOpen: boolean
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => void
  setClose: () => void
}

export const ModalContext = createContext<ModalContextType>({
  data: {},
  isOpen: false,
  setOpen: () => {},
  setClose: () => {},
})

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<ModalData>({})
  const [showingModal, setShowingModal] = useState<React.ReactNode>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const setOpen = async (modal: React.ReactNode, fetchData?: () => Promise<any>) => {
    if (modal) {
      // Fetch data if required
      if (fetchData) {
        const fetchedData = await fetchData()
        setData({ ...data, ...(fetchedData || {}) })
      }
      setShowingModal(modal)
      setIsOpen(true)
    }
  }

  const setClose = () => {
    setIsOpen(false)
    setData({})
    setShowingModal(null)
  }

  // If the component is not mounted, return null to prevent rendering
  if (!isMounted) return null

  return (
    <ModalContext.Provider value={{ data, setOpen, setClose, isOpen }}>
      {children}
      {isOpen && showingModal} {/* Ensure modal only renders when open */}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within the ModalProvider')
  }
  return context
}

export default ModalProvider
