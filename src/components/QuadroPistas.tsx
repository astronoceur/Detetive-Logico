import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from './ui/Modal'
import { useGameStore } from '../store/useGameStore'
import { carregarFase, type FaseData } from '../data/fases/index'
import { CATEGORIAS, type CategoriaPista } from '../data/cruzamento'

interface QuadroPistasProps {
  aberto: boolean
  onFechar: () => void
}

interface PistaCompleta {
  id: string
  fase: number
  categoria: CategoriaPista
  titulo: string
  descricao: string
}

const ICONE_PASTA = '/assets/objetos/pastas_pistas.png'

type Filtro = 'todas' | CategoriaPista

export function QuadroPistas({ aberto, onFechar }: QuadroPistasProps) {
  const pistasColetadas = useGameStore((s) => s.progresso.pistasColetadas)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [todasPistas, setTodasPistas] = useState<PistaCompleta[]>([])

  useEffect(() => {
    if (!aberto) return
    if (todasPistas.length > 0) return
    Promise.all(
      Array.from({ length: 13 }, (_, i) => carregarFase(i + 1))
    ).then((fases) => {
      const lista = fases
        .filter((f): f is FaseData => !!f)
        .map((f) => ({
          id: f.pista.id,
          fase: f.id,
          categoria: f.pista.categoria as CategoriaPista,
          titulo: f.pista.titulo,
          descricao: f.pista.descricao,
        }))
      setTodasPistas(lista)
    })
  }, [aberto, todasPistas.length])

  const pistasFiltradas = useMemo(() => {
    if (filtro === 'todas') return todasPistas
    return todasPistas.filter((p) => p.categoria === filtro)
  }, [todasPistas, filtro])

  const totalColetadas = pistasColetadas.length

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={`Quadro de Investigação — ${totalColetadas}/13 pistas`}
      largura="max-w-4xl"
    >
      <div className="max-h-[65vh] overflow-y-auto scrollbar-thin pr-1">
        <PainelPistas
          pistas={pistasFiltradas}
          todas={todasPistas}
          coletadas={pistasColetadas}
          filtro={filtro}
          onFiltro={setFiltro}
        />
      </div>
    </Modal>
  )
}

interface PainelPistasProps {
  pistas: PistaCompleta[]
  todas: PistaCompleta[]
  coletadas: string[]
  filtro: Filtro
  onFiltro: (f: Filtro) => void
}

function PainelPistas({ pistas, todas, coletadas, filtro, onFiltro }: PainelPistasProps) {
  const contagemPorCategoria = useMemo(() => {
    const mapa: Record<string, number> = { todas: todas.length }
    for (const p of todas) {
      mapa[p.categoria] = (mapa[p.categoria] ?? 0) + 1
    }
    return mapa
  }, [todas])

  return (
    <>
      {/* Filtros por categoria */}
      <div className="flex flex-wrap gap-2 mb-4">
        <ChipFiltro
          ativo={filtro === 'todas'}
          onClick={() => onFiltro('todas')}
          label="Todas"
          contagem={contagemPorCategoria.todas ?? 0}
        />
        {(Object.keys(CATEGORIAS) as CategoriaPista[]).map((cat) => (
          <ChipFiltro
            key={cat}
            ativo={filtro === cat}
            onClick={() => onFiltro(cat)}
            label={`${CATEGORIAS[cat].icon} ${CATEGORIAS[cat].label}`}
            contagem={contagemPorCategoria[cat] ?? 0}
            cor={CATEGORIAS[cat].cor}
          />
        ))}
      </div>

      {/* Grid de pistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pistas.map((p) => {
          const desbloqueada = coletadas.includes(p.id)
          const cat = CATEGORIAS[p.categoria]
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-3 flex gap-3 transition-all"
              style={{
                background: desbloqueada ? 'rgba(96,165,250,0.07)' : 'rgba(255,255,255,0.025)',
                border: desbloqueada
                  ? `1px solid ${cat.cor}33`
                  : '1px dashed rgba(255,255,255,0.1)',
                opacity: desbloqueada ? 1 : 0.55,
              }}
            >
              {/* Pasta */}
              <div className="shrink-0 relative">
                <img
                  src={ICONE_PASTA}
                  alt=""
                  className="w-14 h-14 object-contain"
                  style={{ filter: desbloqueada ? 'none' : 'grayscale(100%) brightness(0.5)' }}
                  draggable={false}
                />
                {!desbloqueada && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xl">
                    🔒
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-blue-400/50 text-xs font-mono">FASE {p.fase}</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                    style={{
                      background: `${cat.cor}1a`,
                      color: cat.cor,
                      border: `1px solid ${cat.cor}40`,
                    }}
                  >
                    {cat.icon} {cat.label}
                  </span>
                </div>
                <p className="text-white font-bold text-sm leading-tight mb-1">
                  {desbloqueada ? p.titulo : 'Pista não descoberta'}
                </p>
                <p className="text-blue-200/65 text-xs leading-snug">
                  {desbloqueada
                    ? p.descricao
                    : 'Resolva o desafio da fase correspondente para revelar esta pista.'}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}

interface ChipFiltroProps {
  ativo: boolean
  onClick: () => void
  label: string
  contagem: number
  cor?: string
}

function ChipFiltro({ ativo, onClick, label, contagem, cor }: ChipFiltroProps) {
  const corBase = cor ?? '#60a5fa'
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
      style={{
        background: ativo ? `${corBase}25` : 'rgba(255,255,255,0.04)',
        border: ativo ? `1px solid ${corBase}80` : '1px solid rgba(255,255,255,0.1)',
        color: ativo ? corBase : 'rgba(147,197,253,0.7)',
      }}
    >
      {label} <span className="opacity-60">· {contagem}</span>
    </button>
  )
}

interface NotificacaoPistaProps {
  aberto: boolean
  onFechar: () => void
  pista: { titulo: string; descricao: string; categoria: CategoriaPista; fase: number } | null
}

export function NotificacaoPista({ aberto, onFechar, pista }: NotificacaoPistaProps) {
  if (!pista) return null
  const cat = CATEGORIAS[pista.categoria]
  return (
    <AnimatePresence>
      {aberto && (
        <>
          <motion.div
            key="backdrop-pista"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={onFechar}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-6">
            <motion.div
              key="modal-pista"
              initial={{ opacity: 0, scale: 0.85, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              className="w-full max-w-md pointer-events-auto"
            >
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'rgba(26,37,51,0.98)',
                  border: `1px solid ${cat.cor}55`,
                  boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 60px ${cat.cor}22`,
                }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: cat.cor }}>
                  Nova Pista Liberada
                </p>
                <motion.img
                  initial={{ rotate: -8, scale: 0.7 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
                  src={ICONE_PASTA}
                  alt="Pasta de pista"
                  className="w-32 h-32 mx-auto my-3 object-contain"
                  style={{ filter: `drop-shadow(0 8px 24px ${cat.cor}55)` }}
                  draggable={false}
                />
                <p className="text-blue-400/60 text-xs font-mono mb-1">FASE {pista.fase}</p>
                <h3 className="text-white text-xl font-bold font-titulo mb-2">{pista.titulo}</h3>
                <span
                  className="inline-block text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider mb-3"
                  style={{
                    background: `${cat.cor}1a`,
                    color: cat.cor,
                    border: `1px solid ${cat.cor}40`,
                  }}
                >
                  {cat.icon} {cat.label}
                </span>
                <p className="text-blue-200/80 text-sm leading-relaxed mb-5">{pista.descricao}</p>
                <button
                  onClick={onFechar}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: `${cat.cor}25`,
                    border: `1px solid ${cat.cor}60`,
                    color: cat.cor,
                  }}
                >
                  Adicionar ao Quadro de Investigação →
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}