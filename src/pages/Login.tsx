import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

export function Login() {
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const setNomeStore = useGameStore((s) => s.setNome)
  const nomeAtual = useGameStore((s) => s.jogador.nome)
  const navigate = useNavigate()

  useEffect(() => {
    if (nomeAtual.trim()) {
      navigate('/menu', { replace: true })
    }
  }, [nomeAtual, navigate])

  function handleEntrar() {
    const nomeLimpo = nome.trim()
    if (!nomeLimpo) {
      setErro('Digite seu nome de detetive para continuar.')
      return
    }
    if (nomeLimpo.length < 2) {
      setErro('O nome precisa ter pelo menos 2 caracteres.')
      return
    }
    setNomeStore(nomeLimpo)
    navigate('/menu', { replace: true })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleEntrar()
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #0d1b2a 0%, #1a2533 50%, #1f3050 100%)`,
      }}
    >
      {/* Background cenário com overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url('/assets/cenarios/menu.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

      {/* Partículas decorativas */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.5, 1] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      {/* Card central */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Ícone de lupa */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-4"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(96, 165, 250, 0.15)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
          </div>
        </motion.div>

        {/* Título */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1
            className="font-titulo text-5xl md:text-6xl font-bold text-white text-sombra"
            style={{ letterSpacing: '0.02em' }}
          >
            Detetive Lógico
          </h1>
          <p className="text-blue-300/80 text-lg mt-2 italic font-light">
            O Caso do Módulo Atlas
          </p>
          <div
            className="mx-auto mt-3 h-px w-32"
            style={{ background: 'linear-gradient(to right, transparent, rgba(96,165,250,0.5), transparent)' }}
          />
        </motion.div>

        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: 'rgba(26, 37, 51, 0.85)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          }}
        >
          <label className="block text-sm font-semibold text-blue-300/80 uppercase tracking-widest mb-3">
            Identificação
          </label>
          <input
            type="text"
            placeholder="Digite seu nome de detetive"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value)
              setErro('')
            }}
            onKeyDown={handleKeyDown}
            maxLength={30}
            className="input-nome mb-1"
            autoFocus
          />
          {erro && (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-400 text-sm mt-2 mb-2"
            >
              {erro}
            </motion.p>
          )}

          <motion.button
            onClick={handleEntrar}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primario w-full mt-5 text-lg"
          >
            Entrar na Investigação
          </motion.button>
        </motion.div>

        <p className="text-center text-blue-400/40 text-xs mt-4">
          Nexum Data Solutions — Acesso Restrito
        </p>
      </motion.div>
    </div>
  )
}
