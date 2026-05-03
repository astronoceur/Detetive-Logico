import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { carregarFase, type FaseData } from '../data/fases/index'
import { CaixaDialogo } from '../components/ui/CaixaDialogo'
import { CATEGORIAS, type CategoriaPista } from '../data/cruzamento'

type Etapa = 'carregando' | 'entrada' | 'dialogo1' | 'dialogo2' | 'desafio' | 'acerto' | 'erro'

const cenarioImagens: Record<string, string> = {
  recepcao: '/assets/cenarios/recepcao.png',
  monitoramento: '/assets/cenarios/monitoramento.png',
  sala_reunioes: '/assets/cenarios/sala_reunioes.png',
  corredor_tecnico: '/assets/cenarios/corredor_tecnico.png',
  laboratorio: '/assets/cenarios/laboratorio.png',
  sala_auditoria: '/assets/cenarios/sala_auditoria.png',
}

const personagemImagens: Record<string, string> = {
  detetive_logico: '/assets/personagens/detetive_logico.png',
  helena_duarte: '/assets/personagens/helena_duarte.png',
  marcos_teles: '/assets/personagens/marcos_teles.png',
  renata_mota: '/assets/personagens/renata_mota.png',
  diego_sampaio: '/assets/personagens/diego_sampaio.png',
  clara_viana: '/assets/personagens/clara_viana.png',
  eduardo_leal: '/assets/personagens/eduardo_leal.png',
}

export function Fase() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const concluirFase = useGameStore((s) => s.concluirFase)
  const fasesConcluidas = useGameStore((s) => s.progresso.fasesConcluidas)

  const [fase, setFase] = useState<FaseData | null>(null)
  const [etapa, setEtapa] = useState<Etapa>('carregando')
  const [indiceDialogo, setIndiceDialogo] = useState(0)
  const jaConclusa = fase ? fasesConcluidas.includes(fase.id) : false

  // Estado da tabela interativa (Fase 4+)
  const [respostasTabela, setRespostasTabela] = useState<Array<Array<string | null>>>([])
  const [tabelaVerificada, setTabelaVerificada] = useState(false)

  const todasPreenchidas =
    respostasTabela.length > 0 && respostasTabela.every((r) => r.every((v) => v !== null))

  function toggleCelula(row: number, col: number) {
    if (tabelaVerificada) return
    const fixas = fase?.desafio.estrutura.colunasPreenchidas ?? 0
    if (col < fixas) return
    setRespostasTabela((prev) => {
      const next = prev.map((r) => [...r])
      const atual = next[row][col]
      next[row][col] = atual === null ? 'V' : atual === 'V' ? 'F' : null
      return next
    })
  }

  function verificarTabelaInterativa() {
    if (!fase) return
    const linhas = fase.desafio.estrutura.linhas
    const todasCorretas = respostasTabela.every((row, i) =>
      row.every((val, j) => val === linhas[i][j])
    )
    if (todasCorretas) {
      if (fase.desafio.pergunta) {
        setTabelaVerificada(true)
      } else {
        if (!jaConclusa) concluirFase(fase.id, fase.pista.id)
        setEtapa('acerto')
      }
    } else {
      setEtapa('erro')
    }
  }

  useEffect(() => {
    const faseId = parseInt(id ?? '0')
    carregarFase(faseId).then((data) => {
      if (data) {
        setFase(data)
        setEtapa('entrada')
      } else {
        navigate('/hub', { replace: true })
      }
    })
  }, [id, navigate])

  const dialogosAtuais =
    etapa === 'dialogo1' ? fase?.dialogos.primeiro ?? [] : fase?.dialogos.segundo ?? []

  const linhaAtual = dialogosAtuais[indiceDialogo]
  const ehDetetive = linhaAtual?.personagem === 'Detetive Lógico'

  const avancarDialogo = useCallback(() => {
    if (!fase) return
    const dialogos = etapa === 'dialogo1' ? fase.dialogos.primeiro : fase.dialogos.segundo
    if (indiceDialogo < dialogos.length - 1) {
      setIndiceDialogo((i) => i + 1)
    } else {
      setIndiceDialogo(0)
      setEtapa(etapa === 'dialogo1' ? 'dialogo2' : 'desafio')
    }
  }, [fase, etapa, indiceDialogo])

  useEffect(() => {
    if (etapa === 'desafio' && fase?.desafio.tipo === 'tabela_verdade_interativa') {
      const fixas = fase.desafio.estrutura.colunasPreenchidas ?? 0
      setRespostasTabela(
        fase.desafio.estrutura.linhas.map((l) =>
          l.map((val, j) => (j < fixas ? val : null))
        )
      )
      setTabelaVerificada(false)
    }
  }, [etapa, fase])

  useEffect(() => {
    if (etapa !== 'dialogo1' && etapa !== 'dialogo2' && etapa !== 'entrada') return
    function handleKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (etapa === 'entrada') setEtapa('dialogo1')
        else avancarDialogo()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [etapa, avancarDialogo])

  function verificarResposta(resposta: number | string) {
    if (!fase) return
    if (resposta === fase.desafio.respostaFinal) {
      if (!jaConclusa) {
        concluirFase(fase.id, fase.pista.id)
      }
      setEtapa('acerto')
    } else {
      setEtapa('erro')
    }
  }

  if (!fase || etapa === 'carregando') {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: '#0d1b2a' }}>
        <p className="text-blue-400/60 text-sm animate-pulse">Carregando investigação...</p>
      </div>
    )
  }

  const cenarioImg = cenarioImagens[fase.cenario]
  const personagemImg = personagemImagens[fase.personagem]
  const detetiveImg = personagemImagens['detetive_logico']

  const Fundo = () => (
    <div className="absolute inset-0">
      {cenarioImg ? (
        <img src={cenarioImg} alt="" className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="w-full h-full" style={{ background: 'radial-gradient(ellipse at center, #1a2533 0%, #0d1b2a 100%)' }} />
      )}
      <div className="absolute inset-0 bg-overlay" />
      <div className="absolute inset-0 bg-black/25" />
    </div>
  )

  const HeaderFase = ({ onClick }: { onClick?: () => void }) => (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4"
      style={{ background: 'rgba(13,27,42,0.7)', borderBottom: '1px solid rgba(96,165,250,0.1)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={onClick ?? (() => navigate('/hub'))}
          className="text-blue-400/60 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
        >
          ← Hub
        </button>
        <div className="h-4 w-px bg-white/15" />
        <span className="text-white/40 text-xs font-mono">FASE {fase.id}</span>
        <span className="text-blue-300 text-xs font-bold">{fase.titulo.toUpperCase()}</span>
      </div>
      <div
        className="text-xs px-3 py-1 rounded-full font-semibold text-blue-300/80"
        style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}
      >
        🧠 {fase.conceito.pilarPC}
      </div>
    </div>
  )

  // ── ENTRADA ──────────────────────────────────────────────────────────────
  if (etapa === 'entrada') {
    return (
      <div
        className="relative w-full h-full flex flex-col overflow-hidden cursor-pointer select-none"
        onClick={() => setEtapa('dialogo1')}
      >
        <Fundo />
        <HeaderFase onClick={(e?: unknown) => { (e as React.MouseEvent)?.stopPropagation?.(); navigate('/hub') }} />

        {/* Personagem — enquadrado da cabeça à cintura */}
        <div className="flex-1 flex items-start justify-center z-10 pt-16 overflow-hidden">
          <motion.img
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            src={personagemImg}
            alt={fase.personagem}
            style={{ height: '180vh', width: 'auto', objectFit: 'contain', maxWidth: '90vw' }}
            draggable={false}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            <CaixaDialogo personagem={null} texto={fase.narracaoEntrada} tipo="naracao" />
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
      </div>
    )
  }

  // ── DIÁLOGOS ─────────────────────────────────────────────────────────────
  if (etapa === 'dialogo1' || etapa === 'dialogo2') {
    const totalLinhas = dialogosAtuais.length
    const isUltimaLinha = indiceDialogo === totalLinhas - 1

    return (
      <div
        className="relative w-full h-full flex flex-col overflow-hidden cursor-pointer select-none"
        onClick={avancarDialogo}
      >
        <Fundo />
        <HeaderFase onClick={(e?: unknown) => { (e as React.MouseEvent)?.stopPropagation?.(); navigate('/hub') }} />

        {/* Indicador de progresso no diálogo */}
        <div className="absolute top-16 right-6 z-20 flex items-center gap-1.5">
          <span className="text-blue-300/50 text-xs">
            {etapa === 'dialogo1' ? '1º Diálogo' : '2º Diálogo'}
          </span>
          <span className="text-white/30 text-xs font-mono">
            {indiceDialogo + 1}/{totalLinhas}
          </span>
        </div>

        {/* Personagem — enquadrado da cabeça à cintura */}
        <div className="flex-1 flex items-start justify-center z-10 pt-16 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={`${etapa}-${linhaAtual?.personagem}`}
              initial={{ opacity: 0, x: ehDetetive ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: ehDetetive ? 16 : -16 }}
              transition={{ duration: 0.3 }}
              src={ehDetetive ? detetiveImg : personagemImg}
              alt={ehDetetive ? 'Detetive Lógico' : fase.personagem}
              style={{ height: '180vh', width: 'auto', objectFit: 'contain', maxWidth: '90vw' }}
              draggable={false}
            />
          </AnimatePresence>
        </div>

        {/* Caixa de diálogo */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${etapa}-${indiceDialogo}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CaixaDialogo
                  personagem={linhaAtual?.personagem ?? null}
                  texto={linhaAtual?.fala ?? ''}
                  tipo="dialogo"
                />
              </motion.div>
            </AnimatePresence>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex justify-end mt-2 pr-2"
            >
              <span className="text-blue-300/60 text-xs font-medium flex items-center gap-1">
                {isUltimaLinha
                  ? etapa === 'dialogo1'
                    ? '→ Segundo Diálogo'
                    : '→ Desafio'
                  : 'Clique para continuar'}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8.5L1.5 4h9L6 8.5z" />
                </svg>
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // ── DESAFIO ───────────────────────────────────────────────────────────────
  if (etapa === 'desafio') {
    const { desafio, conceito } = fase
    const totalOpcoes = desafio.estrutura.linhas.length
    const numBotoes = desafio.numOpcoes ?? totalOpcoes

    return (
      <div
        className="relative w-full h-full overflow-y-auto scrollbar-thin"
        style={{ background: 'radial-gradient(ellipse at 30% 40%, #1f3050 0%, #0d1b2a 70%)' }}
      >
        {/* Fundo suave */}
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <img src={cenarioImg} alt="" className="w-full h-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-black/90" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-5 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/hub')}
              className="text-blue-400/60 hover:text-blue-300 text-sm transition-colors flex items-center gap-1"
            >
              ← Hub
            </button>
            <div className="h-4 w-px bg-white/15" />
            <span className="text-white/40 text-xs font-mono">FASE {fase.id}</span>
            <span className="text-blue-300 text-xs font-bold">{fase.titulo.toUpperCase()}</span>
          </div>

          {/* Card do conceito */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 mb-4"
            style={{ background: 'rgba(26,37,51,0.92)', border: '1px solid rgba(96,165,250,0.2)' }}
          >
            <p className="text-xs font-bold text-blue-400/60 uppercase tracking-widest mb-2">
              📖 Conceito — {conceito.titulo}
            </p>
            <p className="text-blue-100/85 text-sm leading-relaxed mb-3">{conceito.texto}</p>
            <p className="text-xs text-blue-400/50 italic">
              🧠 Pensamento Computacional: <span className="text-blue-300/70">{conceito.pilarPC}</span>
              {conceito.pilarDescricao && ` — ${conceito.pilarDescricao}`}.
            </p>
          </motion.div>

          {/* Tradução lógica */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-xl px-4 py-3 mb-4"
            style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.12)' }}
          >
            <p className="text-xs font-bold text-blue-400/50 uppercase tracking-wider mb-1">Tradução Lógica</p>
            <p className="text-blue-200/70 text-xs leading-relaxed">{fase.traducaoLogica}</p>
          </motion.div>

          {/* Card do desafio */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(26,37,51,0.97)', border: '1px solid rgba(96,165,250,0.28)' }}
          >
            <p className="text-xs font-bold text-blue-400/60 uppercase tracking-widest mb-3">Desafio</p>
            <p className="text-white text-sm font-medium leading-relaxed mb-5">{desafio.enunciado}</p>

            {/* Tabela de classificação (Sim/Não com badge colorido) */}
            {desafio.tipo === 'tabela_classificacao' && (
              <div className="overflow-x-auto mb-5 rounded-xl" style={{ border: '1px solid rgba(96,165,250,0.12)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'rgba(96,165,250,0.08)' }}>
                      {desafio.estrutura.colunas.map((col, i) => (
                        <th key={i} className="text-left text-xs text-blue-400/70 font-bold uppercase tracking-wider px-4 py-2.5">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {desafio.estrutura.linhas.map((linha, i) => {
                      const ehProp = linha[2]?.startsWith('Sim')
                      return (
                        <tr key={i} style={{ borderTop: '1px solid rgba(96,165,250,0.08)' }}>
                          <td className="px-4 py-3 text-blue-400/40 font-mono text-xs w-8">{linha[0]}</td>
                          <td className="px-4 py-3 text-white/75 text-xs leading-snug">{linha[1]}</td>
                          <td className="px-4 py-3">
                            <span
                              className="text-xs px-2.5 py-1 rounded-full font-semibold"
                              style={{
                                background: ehProp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                                color: ehProp ? '#6ee7b7' : '#fca5a5',
                                border: `1px solid ${ehProp ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`,
                              }}
                            >
                              {linha[2]}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tabela de conectivos (informativa, estilo neutro) */}
            {desafio.tipo === 'tabela_conectivos' && (
              <div className="overflow-x-auto mb-5 rounded-xl" style={{ border: '1px solid rgba(96,165,250,0.12)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'rgba(96,165,250,0.08)' }}>
                      {desafio.estrutura.colunas.map((col, i) => (
                        <th key={i} className="text-left text-xs text-blue-400/70 font-bold uppercase tracking-wider px-4 py-2.5">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {desafio.estrutura.linhas.map((linha, i) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(96,165,250,0.08)' }}>
                        <td className="px-4 py-3 text-white/75 text-xs leading-snug italic">{linha[0]}</td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={{ background: 'rgba(96,165,250,0.12)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.25)' }}
                          >
                            {linha[1]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tabela-verdade (células V/F coloridas) */}
            {desafio.tipo === 'tabela_verdade' && (
              <div className="overflow-x-auto mb-5 rounded-xl" style={{ border: '1px solid rgba(96,165,250,0.12)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'rgba(96,165,250,0.08)' }}>
                      {desafio.estrutura.colunas.map((col, i) => (
                        <th key={i} className="text-center text-xs text-blue-400/70 font-bold uppercase tracking-wider px-6 py-2.5 font-mono">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {desafio.estrutura.linhas.map((linha, i) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(96,165,250,0.08)' }}>
                        {linha.map((val, j) => {
                          const ehV = val === 'V'
                          return (
                            <td key={j} className="px-6 py-3 text-center">
                              <span
                                className="text-sm font-bold font-mono px-2.5 py-1 rounded-md"
                                style={{
                                  color: ehV ? '#6ee7b7' : '#fca5a5',
                                  background: ehV ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                                }}
                              >
                                {val}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tabela-verdade interativa — jogador preenche célula a célula */}
            {desafio.tipo === 'tabela_verdade_interativa' && (
              <>
                {(() => {
                  const colunasFixas = desafio.estrutura.colunasPreenchidas ?? 0
                  return (
                    <>
                      {colunasFixas > 0 && (
                        <p className="text-xs text-blue-400/60 italic mb-2">
                          As colunas iniciais já vêm preenchidas — preencha apenas as colunas derivadas.
                        </p>
                      )}
                      <div className="overflow-x-auto mb-4 rounded-xl" style={{ border: '1px solid rgba(96,165,250,0.15)' }}>
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ background: 'rgba(96,165,250,0.08)' }}>
                              {desafio.estrutura.colunas.map((col, i) => {
                                const ehFixa = i < colunasFixas
                                return (
                                  <th
                                    key={i}
                                    className="text-center text-xs font-bold uppercase tracking-wider px-6 py-2.5 font-mono"
                                    style={{ color: ehFixa ? 'rgba(147,197,253,0.5)' : 'rgba(147,197,253,0.85)' }}
                                  >
                                    {col}
                                  </th>
                                )
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {respostasTabela.map((row, i) => (
                              <tr key={i} style={{ borderTop: '1px solid rgba(96,165,250,0.08)' }}>
                                {row.map((val, j) => {
                                  const ehFixa = j < colunasFixas
                                  return (
                                    <td key={j} className="px-4 py-2 text-center">
                                      <motion.button
                                        whileHover={!tabelaVerificada && !ehFixa ? { scale: 1.12 } : {}}
                                        whileTap={!tabelaVerificada && !ehFixa ? { scale: 0.92 } : {}}
                                        onClick={() => toggleCelula(i, j)}
                                        disabled={ehFixa}
                                        className="w-11 h-11 rounded-lg font-bold text-sm font-mono transition-all"
                                        style={{
                                          background: ehFixa
                                            ? 'rgba(96,165,250,0.08)'
                                            : val === 'V'
                                            ? 'rgba(16,185,129,0.15)'
                                            : val === 'F'
                                            ? 'rgba(239,68,68,0.12)'
                                            : 'rgba(96,165,250,0.05)',
                                          border: ehFixa
                                            ? '1px solid rgba(96,165,250,0.2)'
                                            : val === 'V'
                                            ? '1px solid rgba(16,185,129,0.45)'
                                            : val === 'F'
                                            ? '1px solid rgba(239,68,68,0.4)'
                                            : '1.5px dashed rgba(96,165,250,0.3)',
                                          color: ehFixa
                                            ? 'rgba(147,197,253,0.7)'
                                            : val === 'V'
                                            ? '#6ee7b7'
                                            : val === 'F'
                                            ? '#fca5a5'
                                            : '#60a5fa80',
                                          cursor: tabelaVerificada || ehFixa ? 'default' : 'pointer',
                                        }}
                                      >
                                        {val ?? '?'}
                                      </motion.button>
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )
                })()}

                {/* Botão verificar tabela */}
                {!tabelaVerificada && (
                  <motion.button
                    whileHover={todasPreenchidas ? { scale: 1.02 } : {}}
                    whileTap={todasPreenchidas ? { scale: 0.97 } : {}}
                    onClick={todasPreenchidas ? verificarTabelaInterativa : undefined}
                    className="w-full py-3 rounded-xl font-bold text-sm mb-5 transition-all"
                    style={{
                      background: todasPreenchidas ? 'rgba(96,165,250,0.15)' : 'rgba(96,165,250,0.04)',
                      border: `1px solid ${todasPreenchidas ? 'rgba(96,165,250,0.4)' : 'rgba(96,165,250,0.1)'}`,
                      color: todasPreenchidas ? '#93c5fd' : 'rgba(96,165,250,0.3)',
                      cursor: todasPreenchidas ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {todasPreenchidas ? 'Verificar Tabela →' : 'Preencha todas as células para verificar'}
                  </motion.button>
                )}

                {/* Pergunta final — exibida após tabela correta */}
                {tabelaVerificada && desafio.pergunta && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl px-4 py-3 mb-4"
                      style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)' }}
                    >
                      <p className="text-blue-100 text-sm font-medium">{desafio.pergunta}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex gap-2 flex-wrap"
                    >
                      {(desafio.opcoesPerguntaFinal ?? ['Sim', 'Não']).map((opcao) => (
                        <motion.button
                          key={opcao}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => verificarResposta(opcao)}
                          className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
                          style={{
                            background: 'rgba(96,165,250,0.1)',
                            border: '1px solid rgba(96,165,250,0.3)',
                            color: '#93c5fd',
                          }}
                        >
                          {opcao}
                        </motion.button>
                      ))}
                    </motion.div>
                  </>
                )}
              </>
            )}

            {/* Pergunta (exceto tabela interativa, que gerencia o próprio fluxo) */}
            {desafio.tipo !== 'tabela_verdade_interativa' && (
              <div
                className="rounded-xl px-4 py-3 mb-5"
                style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.15)' }}
              >
                <p className="text-blue-100 text-sm font-medium">
                  {desafio.pergunta ?? `Quantas das ${totalOpcoes} frases são proposições lógicas?`}
                </p>
              </div>
            )}

            {/* Botões numéricos (tabela_classificacao e tabela_conectivos) */}
            {(desafio.tipo === 'tabela_classificacao' || desafio.tipo === 'tabela_conectivos') && (
              <div className="flex gap-3">
                {Array.from({ length: numBotoes }, (_, i) => i + 1).map((n) => (
                  <motion.button
                    key={n}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => verificarResposta(n)}
                    className="w-12 h-12 rounded-xl font-bold text-lg transition-all"
                    style={{
                      background: 'rgba(96,165,250,0.1)',
                      border: '1px solid rgba(96,165,250,0.3)',
                      color: '#93c5fd',
                    }}
                  >
                    {n}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Botões V/F (tabela_verdade) */}
            {desafio.tipo === 'tabela_verdade' && (
              <div className="flex gap-3">
                {(['V', 'F'] as const).map((opcao) => (
                  <motion.button
                    key={opcao}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => verificarResposta(opcao)}
                    className="flex-1 h-14 rounded-xl font-bold text-2xl transition-all font-mono"
                    style={{
                      background: opcao === 'V' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                      border: `1px solid ${opcao === 'V' ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.3)'}`,
                      color: opcao === 'V' ? '#6ee7b7' : '#fca5a5',
                    }}
                  >
                    {opcao}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Botões de múltipla escolha */}
            {desafio.tipo === 'multipla_escolha' && (
              <div className="flex flex-col gap-2">
                {desafio.estrutura.linhas.map((linha, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => verificarResposta(linha[0] ?? '')}
                    className="w-full py-3 px-4 rounded-xl text-sm font-medium text-left transition-all"
                    style={{
                      background: 'rgba(96,165,250,0.08)',
                      border: '1px solid rgba(96,165,250,0.2)',
                      color: '#93c5fd',
                    }}
                  >
                    {linha[0]}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  // ── ACERTO ────────────────────────────────────────────────────────────────
  if (etapa === 'acerto') {
    const cat = CATEGORIAS[fase.pista.categoria as CategoriaPista]
    return (
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        <Fundo />
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 overflow-y-auto py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="max-w-lg w-full rounded-2xl p-7"
            style={{
              background: 'rgba(26,37,51,0.98)',
              border: '1px solid rgba(16,185,129,0.35)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.65)',
            }}
          >
            {/* Ícone */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold text-green-300"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                ✓
              </div>
              <h2 className="text-xl font-bold text-white font-titulo">{fase.feedback.acerto.titulo}</h2>
            </div>

            <p className="text-blue-100/80 text-sm leading-relaxed mb-5">
              {fase.feedback.acerto.mensagem}
            </p>

            {/* Pasta de Pista — recompensa visual */}
            <div
              className="rounded-2xl p-5 mb-6 text-center"
              style={{
                background: `${cat.cor}10`,
                border: `1px solid ${cat.cor}55`,
                boxShadow: `inset 0 0 40px ${cat.cor}10`,
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: cat.cor }}>
                ✦ Nova Pista Liberada ✦
              </p>
              <motion.img
                initial={{ rotate: -6, scale: 0.7, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.25 }}
                src="/assets/objetos/pastas_pistas.png"
                alt="Pasta de pista"
                className="w-28 h-28 mx-auto mb-3 object-contain"
                style={{ filter: `drop-shadow(0 8px 24px ${cat.cor}55)` }}
                draggable={false}
              />
              <h3 className="text-white text-base font-bold font-titulo mb-1">{fase.pista.titulo}</h3>
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
              <p className="text-blue-200/80 text-sm leading-relaxed">
                {fase.feedback.acerto.pistaLiberada}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/hub')}
              className="btn-primario w-full"
            >
              Voltar ao Hub de Investigação →
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── ERRO ──────────────────────────────────────────────────────────────────
  if (etapa === 'erro') {
    return (
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        <Fundo />
        <div className="relative z-10 flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="max-w-lg w-full rounded-2xl p-7"
            style={{
              background: 'rgba(26,37,51,0.98)',
              border: '1px solid rgba(239,68,68,0.3)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.65)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold text-red-300"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                ✕
              </div>
              <h2 className="text-xl font-bold text-white font-titulo">{fase.feedback.erro.titulo}</h2>
            </div>

            <p className="text-blue-100/80 text-sm leading-relaxed mb-2">
              {fase.feedback.erro.dica}
            </p>
            <p className="text-blue-400/50 text-xs italic mb-6">
              Tente novamente — o caderno de campo está aberto.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setEtapa('desafio')}
              className="btn-primario w-full"
            >
              Tentar Novamente
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  return null
}
