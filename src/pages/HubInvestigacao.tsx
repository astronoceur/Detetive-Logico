import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import cenarioData from '../data/cenarios.json'
import personagemData from '../data/personagens.json'
import { QuadroPistas } from '../components/QuadroPistas'

interface Cenario {
  id: string
  nome: string
  imagem: string
  personagem: string
  fases: number[]
}

const cenarios = cenarioData as Cenario[]

export function HubInvestigacao() {
  const navigate = useNavigate()
  const progresso = useGameStore((s) => s.progresso)
  const nome = useGameStore((s) => s.jogador.nome)
  const [quadroAberto, setQuadroAberto] = useState(false)

  const totalPistas = progresso.pistasColetadas.length
  const totalFases = progresso.fasesConcluidas.length
  const todasPistas = totalPistas >= 13

  function isFaseDisponivel(faseId: number): boolean {
    if (faseId === 1) return true
    return progresso.fasesConcluidas.includes(faseId - 1)
  }

  function getStatusCenario(cenario: Cenario) {
    const fasesDisponiveis = cenario.fases.filter((f) => isFaseDisponivel(f))
    const fasesConcluidas = cenario.fases.filter((f) =>
      progresso.fasesConcluidas.includes(f)
    )

    if (fasesConcluidas.length === cenario.fases.length) return 'concluido'
    if (fasesDisponiveis.length > 0) return 'disponivel'
    return 'bloqueado'
  }

  function handleCenarioClick(cenario: Cenario) {
    const status = getStatusCenario(cenario)
    if (status === 'bloqueado') return

    // Encontra a primeira fase disponível e não concluída deste cenário
    const proximaFase = cenario.fases.find(
      (f) => isFaseDisponivel(f) && !progresso.fasesConcluidas.includes(f)
    )

    if (proximaFase) {
      navigate(`/fase/${proximaFase}`)
    }
  }

  function getPersonagem(personagemId: string) {
    return personagemData.find((p) => p.id === personagemId)
  }

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 30% 50%, #1f3050 0%, #0d1b2a 60%, #1a2533 100%)' }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between px-6 py-4"
        style={{
          background: 'rgba(13, 27, 42, 0.8)',
          borderBottom: '1px solid rgba(96, 165, 250, 0.15)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div>
          <button
            onClick={() => navigate('/menu')}
            className="text-blue-400/60 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1 mb-1"
          >
            ← Menu
          </button>
          <h1 className="font-titulo text-2xl font-bold text-white">Hub de Investigação</h1>
          <p className="text-blue-300/60 text-xs">Nexum Data Solutions — Planta Baixa</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Quadro de Pistas */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setQuadroAberto(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'rgba(96,165,250,0.1)',
              border: '1px solid rgba(96,165,250,0.3)',
              color: '#93c5fd',
            }}
            title="Abrir Quadro de Investigação"
          >
            <img
              src="/assets/objetos/pastas_pistas.png"
              alt=""
              className="w-7 h-7 object-contain"
              draggable={false}
            />
            <div className="text-left leading-tight">
              <div className="text-[10px] uppercase tracking-wider text-blue-400/60">Quadro</div>
              <div className="text-xs">{totalPistas}/13 pistas</div>
            </div>
          </motion.button>

          {/* Progresso */}
          <div className="text-right">
            <div className="text-xs text-blue-400/60 font-semibold uppercase tracking-wider">Progresso</div>
            <div className="text-white font-bold">
              {totalFases}
              <span className="text-blue-400/60 font-normal">/13 fases</span>
            </div>
            <div className="text-white font-bold">
              {totalPistas}
              <span className="text-blue-400/60 font-normal">/13 pistas</span>
            </div>
          </div>

          {/* Barra de pistas */}
          <div className="hidden md:block w-32">
            <div className="text-xs text-blue-400/60 mb-1">Pistas</div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(totalPistas / 13) * 100}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-full rounded-full bg-blue-500"
              />
            </div>
          </div>

          {/* Botão acusar */}
          <motion.button
            whileHover={todasPistas ? { scale: 1.03 } : {}}
            whileTap={todasPistas ? { scale: 0.97 } : {}}
            onClick={() => todasPistas && navigate('/desafio-final')}
            disabled={!todasPistas}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              todasPistas
                ? 'bg-red-700 hover:bg-red-600 text-white border border-red-500/40 cursor-pointer'
                : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
            }`}
            title={todasPistas ? 'Acusar culpado' : `Colete todas as 13 pistas primeiro (${totalPistas}/13)`}
          >
            {todasPistas ? '⚖ Acusar Culpado' : `🔒 ${totalPistas}/13 pistas`}
          </motion.button>
        </div>
      </motion.header>

      {/* Grade de cenários */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="max-w-5xl mx-auto">
          {/* Detetive */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-5 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-300/70 text-sm">
              Detetive <span className="text-white font-semibold">{nome}</span> — selecione um local para investigar
            </span>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cenarios.map((cenario, i) => {
              const status = getStatusCenario(cenario)
              const personagem = getPersonagem(cenario.personagem)

              return (
                <motion.div
                  key={cenario.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  onClick={() => handleCenarioClick(cenario)}
                  className={`card-cenario group ${status === 'bloqueado' ? 'locked' : ''}`}
                  style={{ cursor: status === 'bloqueado' ? 'not-allowed' : 'pointer' }}
                >
                  {/* Imagem do cenário */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={cenario.imagem}
                      alt={cenario.nome}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        status !== 'bloqueado' ? 'group-hover:scale-105' : 'grayscale opacity-50'
                      }`}
                      draggable={false}
                    />

                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-2 right-2">
                      {status === 'concluido' && (
                        <span
                          className="text-xs px-2 py-1 rounded-full font-bold text-green-300"
                          style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16,185,129,0.3)' }}
                        >
                          ✓ Concluído
                        </span>
                      )}
                      {status === 'disponivel' && (
                        <motion.span
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-xs px-2 py-1 rounded-full font-bold text-blue-300"
                          style={{ background: 'rgba(96, 165, 250, 0.2)', border: '1px solid rgba(96,165,250,0.4)' }}
                        >
                          ● Disponível
                        </motion.span>
                      )}
                      {status === 'bloqueado' && (
                        <span
                          className="text-xs px-2 py-1 rounded-full font-bold text-white/40"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          🔒
                        </span>
                      )}
                    </div>

                    {/* Personagem thumbnail */}
                    {personagem && status !== 'bloqueado' && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-2">
                        <img
                          src={personagem.imagem}
                          alt={personagem.nome}
                          className="w-10 h-10 object-cover object-top rounded-full border border-blue-400/40"
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Info do cenário */}
                  <div
                    className="p-3"
                    style={{ background: 'rgba(13, 27, 42, 0.9)' }}
                  >
                    <h3 className="text-white font-bold text-sm">{cenario.nome}</h3>
                    {personagem && (
                      <p className="text-blue-300/60 text-xs mt-0.5">{personagem.nome}</p>
                    )}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {cenario.fases.map((f) => (
                        <span
                          key={f}
                          className="text-xs px-1.5 py-0.5 rounded font-mono"
                          style={{
                            background: progresso.fasesConcluidas.includes(f)
                              ? 'rgba(16, 185, 129, 0.15)'
                              : isFaseDisponivel(f)
                              ? 'rgba(96, 165, 250, 0.12)'
                              : 'rgba(255,255,255,0.05)',
                            color: progresso.fasesConcluidas.includes(f)
                              ? '#6ee7b7'
                              : isFaseDisponivel(f)
                              ? '#93c5fd'
                              : 'rgba(255,255,255,0.3)',
                          }}
                        >
                          F{f}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Modal — Quadro de Investigação */}
          <QuadroPistas aberto={quadroAberto} onFechar={() => setQuadroAberto(false)} />

          {/* Aviso quando hub está bloqueado */}
          {totalFases === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center"
            >
              <div
                className="inline-block px-5 py-3 rounded-xl text-sm text-blue-300/70"
                style={{
                  background: 'rgba(96, 165, 250, 0.06)',
                  border: '1px solid rgba(96, 165, 250, 0.15)',
                }}
              >
                💡 Comece pela <strong className="text-blue-300">Recepção</strong> — Clara Viana aguarda seu interrogatório.
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
