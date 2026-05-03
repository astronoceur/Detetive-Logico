import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

interface ModalProps {
  aberto: boolean
  onFechar: () => void
  titulo: string
  children: ReactNode
  largura?: string
}

export function Modal({ aberto, onFechar, titulo, children, largura = 'max-w-lg' }: ModalProps) {
  return (
    <AnimatePresence>
      {aberto && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onFechar}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 25 }}
            className={`w-[90%] ${largura} pointer-events-auto`}
          >
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(26, 37, 51, 0.97)',
                border: '1px solid rgba(96, 165, 250, 0.25)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white font-titulo text-2xl">{titulo}</h2>
                <button
                  onClick={onFechar}
                  className="text-blue-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                  aria-label="Fechar"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                  </svg>
                </button>
              </div>
              <div className="text-blue-100">{children}</div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
