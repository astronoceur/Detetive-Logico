import { motion } from 'framer-motion'
import type { ReactNode, MouseEvent } from 'react'

interface BotaoProps {
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  variante?: 'primario' | 'secundario' | 'perigo'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}

export function Botao({
  children,
  onClick,
  variante = 'primario',
  disabled = false,
  className = '',
  type = 'button',
}: BotaoProps) {
  const estilos = {
    primario: 'btn-primario',
    secundario: 'btn-secundario',
    perigo: 'bg-red-700 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-xl border border-red-500/40 transition-all duration-200',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`${estilos[variante]} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {children}
    </motion.button>
  )
}
