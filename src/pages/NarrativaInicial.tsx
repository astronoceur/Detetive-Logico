import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { CaixaDialogo } from '../components/ui/CaixaDialogo'
import narrativaData from '../data/narrativaInicial.json'

interface Slide {
  id: string
  tipo: string
  personagem: string | null
  nomeExibido: string | null
  texto: string
  cenario: string | null
}

const slides = narrativaData as Slide[]

const cenarioImagens: Record<string, string> = {
  sala_reunioes: '/assets/cenarios/sala_reunioes.png',
  monitoramento: '/assets/cenarios/monitoramento.png',
  recepcao: '/assets/cenarios/recepcao.png',
  laboratorio: '/assets/cenarios/laboratorio.png',
  corredor_tecnico: '/assets/cenarios/corredor_tecnico.png',
  sala_auditoria: '/assets/cenarios/sala_auditoria.png',
}

const personagemImagens: Record<string, string> = {
  detetive: '/assets/personagens/detetive_logico.png',
  helena_duarte: '/assets/personagens/helena_duarte.png',
  marcos_teles: '/assets/personagens/marcos_teles.png',
  renata_mota: '/assets/personagens/renata_mota.png',
  diego_sampaio: '/assets/personagens/diego_sampaio.png',
  clara_viana: '/assets/personagens/clara_viana.png',
  eduardo_leal: '/assets/personagens/eduardo_leal.png',
}

export function NarrativaInicial() {
  const [indice, setIndice] = useState(0)
  const navigate = useNavigate()
  const marcarVista = useGameStore((s) => s.marcarNarrativaVista)

  const slideAtual = slides[indice]
  const total = slides.length
  const ultimo = indice === total - 1

  const avancar = useCallback(() => {
    if (ultimo) {
      marcarVista()
      navigate('/hub', { replace: true })
    } else {
      setIndice((i) => i + 1)
    }
  }, [ultimo, marcarVista, navigate])

  // Avançar com espaço ou Enter
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        avancar()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [avancar])

  const cenarioAtual = slideAtual.cenario ? cenarioImagens[slideAtual.cenario] : null
  const personagemAtual = slideAtual.personagem
    ? personagemImagens[slideAtual.personagem] ?? null
    : null

  const ehFicha = slideAtual.tipo === 'ficha_suspeito'
  const ehTitulo = slideAtual.tipo === 'titulo'

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden cursor-pointer select-none"
      onClick={avancar}
    >
      {/* Fundo — cenário */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slideAtual.cenario ?? 'none'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {cenarioAtual ? (
            <img
              src={cenarioAtual}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: 'radial-gradient(ellipse at center, #1a2533 0%, #0d1b2a 100%)',
              }}
            />
          )}
          <div className="absolute inset-0 bg-overlay" />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Contador */}
      <div className="absolute top-5 right-6 z-20 flex items-center gap-2">
        <div className="flex gap-1">
          {slides.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === indice ? '16px' : '5px',
                height: '5px',
                background: i === indice ? '#60a5fa' : i < indice ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Botão pular */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          marcarVista()
          navigate('/hub', { replace: true })
        }}
        className="absolute top-5 left-6 z-20 text-white/40 hover:text-white/70 text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
      >
        Pular narrativa →
      </button>

      {/* Tela de título */}
      {ehTitulo && (
        <div className="flex-1 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="font-titulo text-5xl md:text-6xl font-bold text-white text-sombra">
              {slideAtual.texto}
            </h2>
            <div className="mt-3 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
          </motion.div>
        </div>
      )}

      {/* Ficha de suspeito */}
      {ehFicha && (
        <div className="flex-1 flex items-center justify-center z-10 px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-6 max-w-3xl w-full"
          >
            {/* Imagem do personagem */}
            {personagemAtual && (
              <motion.img
                key={slideAtual.personagem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                src={personagemAtual}
                alt={slideAtual.nomeExibido ?? ''}
                style={{ height: '440px', width: 'auto', objectFit: 'contain', flexShrink: 0 }}
                draggable={false}
              />
            )}
            {/* Card ficha */}
            <div
              className="flex-1 rounded-2xl p-5"
              style={{
                background: 'rgba(26, 37, 51, 0.9)',
                border: '1px solid rgba(96, 165, 250, 0.25)',
              }}
            >
              <p className="text-xs font-bold text-blue-400/70 uppercase tracking-widest mb-1">
                Suspeito
              </p>
              <h3 className="text-2xl font-bold text-white mb-3">{slideAtual.nomeExibido}</h3>
              <p className="text-blue-100/80 text-sm leading-relaxed italic">{slideAtual.texto}</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Personagem no centro (diálogos normais) — enquadrado da cabeça à cintura */}
      {!ehFicha && !ehTitulo && personagemAtual && (
        <div className="flex-1 flex items-start justify-center z-10 pt-16 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={slideAtual.personagem}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              src={personagemAtual}
              alt={slideAtual.nomeExibido ?? ''}
              style={{ height: '180vh', width: 'auto', objectFit: 'contain', maxWidth: '90vw' }}
              draggable={false}
            />
          </AnimatePresence>
        </div>
      )}

      {/* Caixa de diálogo */}
      {!ehFicha && !ehTitulo && (
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            <CaixaDialogo
              personagem={slideAtual.nomeExibido}
              texto={slideAtual.texto}
              tipo={slideAtual.tipo === 'naracao' ? 'naracao' : 'dialogo'}
            />
            {/* Indicador de avanço */}
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex justify-end mt-2 pr-2"
            >
              <span className="text-blue-300/60 text-xs font-medium flex items-center gap-1">
                Clique ou pressione Espaço
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8.5L1.5 4h9L6 8.5z" />
                </svg>
              </span>
            </motion.div>
          </div>
        </div>
      )}

      {/* Botão próximo para fichas e títulos */}
      {(ehFicha || ehTitulo) && (
        <div className="absolute bottom-6 right-6 z-20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primario flex items-center gap-2"
          >
            {ultimo ? 'Iniciar Investigação' : 'Próximo'}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </motion.button>
        </div>
      )}
    </div>
  )
}
