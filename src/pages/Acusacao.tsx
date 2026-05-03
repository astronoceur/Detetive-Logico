import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import personagemData from '../data/personagens.json'
import { QuadroPistas } from '../components/QuadroPistas'

type Etapa = 'briefing' | 'escolha' | 'resultado'

interface Personagem {
  id: string
  nome: string
  cargo: string
  imagem: string
}

const VARIAVEIS = [
  { id: 'a', desc: 'O suspeito esteve fisicamente no laboratório do Atlas entre 22h36 e 22h44.' },
  { id: 'b', desc: 'Houve registro digital (biométrico ou crachá) ligando o suspeito ao acesso ao Atlas naquela janela.' },
  { id: 'c', desc: 'O suspeito apresentou álibi verificável e consistente com os logs do sistema.' },
  { id: 'd', desc: 'O suspeito tinha conhecimento técnico ou administrativo para retirar o Módulo Atlas sem disparar alarme manualmente.' },
]

const AVALIACAO: Record<string, { a: boolean; b: boolean; c: boolean; d: boolean }> = {
  helena_duarte: { a: false, b: false, c: false, d: true },
  marcos_teles: { a: false, b: false, c: true, d: true },
  renata_mota: { a: true, b: true, c: false, d: true },
  diego_sampaio: { a: false, b: false, c: true, d: true },
  clara_viana: { a: false, b: false, c: true, d: false },
  eduardo_leal: { a: false, b: false, c: true, d: true },
}

function avaliarCulpa(suspId: string): boolean {
  const v = AVALIACAO[suspId]
  if (!v) return false
  return v.a && v.b && v.d && !v.c
}

function explicarFalha(suspId: string): string[] {
  const v = AVALIACAO[suspId]
  if (!v) return []
  const falhas: string[] = []
  if (!v.a) falhas.push('Não esteve fisicamente no laboratório na janela do crime (a = F).')
  if (!v.b) falhas.push('Não há registro digital ligando-o ao acesso ao Atlas (b = F).')
  if (v.c) falhas.push('Apresentou álibi verificável (c = V) — mas a fórmula exige ¬c.')
  if (!v.d) falhas.push('Não tinha conhecimento técnico/administrativo suficiente (d = F).')
  return falhas
}

const personagens = personagemData as Personagem[]

export function Acusacao() {
  const navigate = useNavigate()
  const progresso = useGameStore((s) => s.progresso)
  const setDesafioFinal = useGameStore((s) => s.setDesafioFinal)

  const [etapa, setEtapa] = useState<Etapa>('briefing')
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [acertou, setAcertou] = useState(false)
  const [quadroAberto, setQuadroAberto] = useState(false)

  useEffect(() => {
    if (progresso.pistasColetadas.length < 13) {
      navigate('/hub', { replace: true })
    }
  }, [progresso.pistasColetadas, navigate])

  function confirmar() {
    if (!selecionado) return
    const ehCulpado = avaliarCulpa(selecionado)
    setAcertou(ehCulpado)
    setDesafioFinal(ehCulpado)
    setEtapa('resultado')
  }

  function tentarNovamente() {
    setSelecionado(null)
    setEtapa('escolha')
  }

  const personagemSelecionado = selecionado
    ? personagens.find((p) => p.id === selecionado) ?? null
    : null

  // ── BRIEFING ───────────────────────────────────────────────────────────────
  if (etapa === 'briefing') {
    return (
      <div
        className="relative w-full h-full overflow-y-auto scrollbar-thin"
        style={{ background: 'radial-gradient(ellipse at 30% 20%, #2a1a35 0%, #0d1b2a 70%)' }}
      >
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/hub')}
              className="text-blue-400/60 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
            >
              ← Hub
            </button>
            <div
              className="text-xs px-3 py-1 rounded-full font-bold text-red-300/80"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              ⚖ DESAFIO FINAL
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-titulo text-3xl md:text-4xl font-bold text-white mb-3"
          >
            A Acusação
          </motion.h1>

          {/* Cena de confronto */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-5 mb-4"
            style={{ background: 'rgba(26,37,51,0.92)', border: '1px solid rgba(96,165,250,0.18)' }}
          >
            <p className="text-xs font-bold text-blue-400/60 uppercase tracking-widest mb-2">Cena de Confronto</p>
            <p className="text-blue-100/80 text-sm leading-relaxed italic">
              Madrugada. O Detetive reúne os seis suspeitos na sala de reuniões. As cortinas continuam
              fechadas. Sobre a mesa: o caderno de campo aberto, treze tabelas-verdade preenchidas a caneta,
              e treze pistas numeradas.
            </p>
          </motion.div>

          {/* Fala do detetive */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="rounded-2xl p-5 mb-6"
            style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.22)' }}
          >
            <p className="text-xs font-bold text-blue-300/70 uppercase tracking-wider mb-2">Detetive Lógico</p>
            <p className="text-white text-sm leading-relaxed">
              "Vou reconstruir os fatos por raciocínio lógico, não por intuição. Cada um de vocês fez
              afirmações que, isoladas, podem soar plausíveis. Mas combinadas, formam um sistema de
              proposições — e esse sistema tem apenas uma solução consistente."
            </p>
          </motion.div>

          {/* Variáveis lógicas */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="rounded-2xl p-5 mb-4"
            style={{ background: 'rgba(26,37,51,0.92)', border: '1px solid rgba(96,165,250,0.18)' }}
          >
            <p className="text-xs font-bold text-blue-400/60 uppercase tracking-widest mb-3">
              Variáveis Lógicas do Caso
            </p>
            <div className="space-y-2">
              {VARIAVEIS.map((v) => (
                <div key={v.id} className="flex items-start gap-3">
                  <span
                    className="text-sm font-mono font-bold text-blue-300 w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.35)' }}
                  >
                    {v.id}
                  </span>
                  <p className="text-blue-100/80 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fórmula */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="rounded-2xl p-5 mb-4 text-center"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <p className="text-xs font-bold text-red-300/70 uppercase tracking-widest mb-3">Fórmula do Culpado</p>
            <p className="font-mono text-lg text-white mb-2">
              Culpado(x) ≡ ( a(x) ∧ b(x) ∧ d(x) ) ∧ ¬c(x)
            </p>
            <p className="text-xs text-blue-200/60 italic">
              Pela Lei de De Morgan, equivale a: ¬( ¬a(x) ∨ ¬b(x) ∨ ¬d(x) ∨ c(x) )
            </p>
          </motion.div>

          {/* Pistas coletadas — botão para abrir quadro completo */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setQuadroAberto(true)}
            className="w-full rounded-2xl p-5 mb-6 flex items-center gap-4 text-left transition-all"
            style={{ background: 'rgba(26,37,51,0.92)', border: '1px solid rgba(96,165,250,0.25)' }}
          >
            <img
              src="/assets/objetos/pastas_pistas.png"
              alt=""
              className="w-16 h-16 object-contain shrink-0"
              draggable={false}
            />
            <div className="flex-1">
              <p className="text-xs font-bold text-blue-400/70 uppercase tracking-widest mb-1">
                🔍 Quadro de Investigação
              </p>
              <p className="text-white text-sm font-semibold mb-0.5">
                {progresso.pistasColetadas.length}/13 pistas coletadas
              </p>
              <p className="text-blue-200/65 text-xs">
                Clique para revisar todas as pistas e o cruzamento de suspeitos antes de acusar.
              </p>
            </div>
            <span className="text-blue-300/60 text-xl">→</span>
          </motion.button>

          {/* Botão prosseguir */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setEtapa('escolha')}
            className="w-full py-4 rounded-xl font-bold text-base transition-all"
            style={{
              background: 'rgba(239,68,68,0.18)',
              border: '1px solid rgba(239,68,68,0.45)',
              color: '#fca5a5',
            }}
          >
            Apresentar os Suspeitos →
          </motion.button>
        </div>
        <QuadroPistas aberto={quadroAberto} onFechar={() => setQuadroAberto(false)} />
      </div>
    )
  }

  // ── ESCOLHA ────────────────────────────────────────────────────────────────
  if (etapa === 'escolha') {
    return (
      <div
        className="relative w-full h-full overflow-y-auto scrollbar-thin"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, #2a1a35 0%, #0d1b2a 70%)' }}
      >
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setEtapa('briefing')}
              className="text-blue-400/60 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
            >
              ← Briefing
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuadroAberto(true)}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-semibold text-blue-300 transition-all hover:bg-blue-500/15"
                style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.3)' }}
              >
                <img
                  src="/assets/objetos/pastas_pistas.png"
                  alt=""
                  className="w-5 h-5 object-contain"
                  draggable={false}
                />
                Revisar Pistas
              </button>
              <div
                className="text-xs px-3 py-1 rounded-full font-bold text-red-300/80"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                ⚖ DESAFIO FINAL
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
            <h1 className="font-titulo text-3xl font-bold text-white mb-2">Quem é o culpado?</h1>
            <p className="text-blue-200/70 text-sm">
              Clique no suspeito que satisfaz a fórmula{' '}
              <span className="font-mono text-blue-300">(a ∧ b ∧ d) ∧ ¬c</span> e confirme sua acusação.
            </p>
          </motion.div>

          {/* Grid de suspeitos */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {personagens.map((p, i) => {
              const ehSelecionado = selecionado === p.id
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelecionado(p.id)}
                  className="rounded-2xl overflow-hidden transition-all relative"
                  style={{
                    background: ehSelecionado ? 'rgba(239,68,68,0.12)' : 'rgba(26,37,51,0.92)',
                    border: ehSelecionado
                      ? '2px solid rgba(239,68,68,0.7)'
                      : '1px solid rgba(96,165,250,0.18)',
                    boxShadow: ehSelecionado ? '0 0 30px rgba(239,68,68,0.25)' : 'none',
                  }}
                >
                  {ehSelecionado && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-base font-bold"
                      style={{
                        background: 'rgba(239,68,68,0.85)',
                        color: '#fff',
                        boxShadow: '0 4px 12px rgba(239,68,68,0.5)',
                      }}
                    >
                      ⚖
                    </motion.div>
                  )}
                  <div className="aspect-[3/4] overflow-hidden bg-gradient-to-b from-blue-900/40 to-blue-950/60">
                    <img
                      src={p.imagem}
                      alt={p.nome}
                      className="w-full h-full object-cover object-top"
                      style={{ filter: ehSelecionado ? 'none' : 'brightness(0.92)' }}
                      draggable={false}
                    />
                  </div>
                  <div className="p-3 text-left">
                    <p
                      className="font-bold text-sm"
                      style={{ color: ehSelecionado ? '#fca5a5' : '#ffffff' }}
                    >
                      {p.nome}
                    </p>
                    <p className="text-blue-300/60 text-xs">{p.cargo}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Indicador de seleção + botão confirmar */}
          <AnimatePresence>
            {selecionado && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <p className="text-sm text-blue-100/80 mb-3 text-center">
                  Você está prestes a acusar{' '}
                  <span className="font-bold text-red-300">{personagemSelecionado?.nome}</span> pelo roubo
                  do Módulo Atlas. Esta decisão será validada pela fórmula lógica.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmar}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: 'rgba(239,68,68,0.25)',
                    border: '1px solid rgba(239,68,68,0.6)',
                    color: '#fff',
                  }}
                >
                  ⚖ Confirmar Acusação
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <QuadroPistas aberto={quadroAberto} onFechar={() => setQuadroAberto(false)} />
      </div>
    )
  }

  // ── RESULTADO ──────────────────────────────────────────────────────────────
  if (etapa === 'resultado') {
    if (acertou) {
      return (
        <div
          className="relative w-full h-full overflow-y-auto scrollbar-thin"
          style={{ background: 'radial-gradient(ellipse at 50% 20%, #1a3a2a 0%, #0d1b2a 70%)' }}
        >
          <div className="max-w-2xl mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="rounded-2xl p-7"
              style={{
                background: 'rgba(26,37,51,0.98)',
                border: '1px solid rgba(16,185,129,0.4)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.65)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-green-300"
                  style={{ background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.4)' }}
                >
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-green-300/70 uppercase tracking-wider">Caso Resolvido</p>
                  <h2 className="text-2xl font-bold text-white font-titulo">Renata Mota é a Culpada</h2>
                </div>
              </div>

              <p className="text-xs font-bold text-blue-400/60 uppercase tracking-widest mb-2">
                Reconstrução Lógica do Crime
              </p>
              <div className="space-y-3 text-blue-100/85 text-sm leading-relaxed mb-5">
                <p>
                  Renata Mota desenvolveu o Módulo Atlas e cresceu profissionalmente em torno do projeto.
                  Após um conflito recente com a diretoria sobre direitos autorais e reconhecimento, ela passou
                  a temer que o algoritmo fosse apresentado aos investidores sem sua devida participação.
                </p>
                <p>
                  Na quinta-feira à noite, Renata acessou o laboratório às 22h38. O sistema biométrico
                  registrou sua entrada — pista que ela mais tarde tentaria explicar como 'clonagem'.
                </p>
                <p>
                  Às 22h40, uma queda automática de tensão derrubou o alarme e o sistema de crachás por
                  aproximadamente quatro minutos. Renata sabia que essa janela existiria — coincidências
                  favorecem quem conhece a infraestrutura.
                </p>
                <p>
                  Aproveitando esses quatro minutos, ela retirou o Módulo Atlas do armário de segurança. O
                  blackout da câmera da catraca (correlacionado, mas independente, à saída de Diego para o
                  café) deu cobertura adicional.
                </p>
                <p>
                  Seu álibi do 'banheiro' contradiz tanto o registro biométrico quanto sua negação posterior.
                  Pela bicondicional que ela mesma estabeleceu (acesso ↔ registro), ela se condenou
                  logicamente. Pela negação simples de seu álibi, a contradição se confirma.
                </p>
                <p className="font-medium text-green-200/85">
                  Os outros suspeitos têm motivações e oportunidades, mas nenhum deles satisfaz
                  simultaneamente as quatro condições da fórmula. Apenas Renata: a = V, b = V, d = V, c = F.
                </p>
              </div>

              <div
                className="rounded-xl p-4 mb-6"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <p className="text-green-200/85 text-sm leading-relaxed">
                  Você fechou o caso. O Módulo Atlas será recuperado. A apresentação aos investidores
                  ocorrerá no prazo. Parabéns, <span className="font-bold">Detetive Lógico</span>.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/menu')}
                className="btn-primario w-full"
              >
                Voltar ao Menu Principal
              </motion.button>
            </motion.div>
          </div>
        </div>
      )
    }

    // Erro — feedback pedagógico
    const falhas = selecionado ? explicarFalha(selecionado) : []
    return (
      <div
        className="relative w-full h-full overflow-y-auto scrollbar-thin"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, #3a1a25 0%, #0d1b2a 70%)' }}
      >
        <div className="max-w-2xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="rounded-2xl p-7"
            style={{
              background: 'rgba(26,37,51,0.98)',
              border: '1px solid rgba(239,68,68,0.35)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.65)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-red-300"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)' }}
              >
                ✕
              </div>
              <div>
                <p className="text-xs font-bold text-red-300/70 uppercase tracking-wider">Acusação Incorreta</p>
                <h2 className="text-2xl font-bold text-white font-titulo">{personagemSelecionado?.nome}</h2>
              </div>
            </div>

            <p className="text-blue-100/80 text-sm leading-relaxed mb-4">
              A análise lógica da fórmula{' '}
              <span className="font-mono text-blue-300">Culpado(x) ≡ (a ∧ b ∧ d) ∧ ¬c</span> não foi
              satisfeita pelo suspeito que você apontou.
            </p>

            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <p className="text-xs font-bold text-red-300/80 uppercase tracking-wider mb-2">
                Por que {personagemSelecionado?.nome} não atende à fórmula
              </p>
              <ul className="space-y-1.5">
                {falhas.map((f, i) => (
                  <li key={i} className="text-red-200/85 text-sm flex gap-2">
                    <span className="text-red-400/60">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-blue-200/70 text-sm leading-relaxed mb-2">
              Reveja as pistas, especialmente as contradições mais fortes. Pergunte-se: qual suspeito está
              fisicamente no laboratório (a = V), tem registro digital (b = V), tem capacidade
              técnica/administrativa (d = V), e não tem álibi verificável (c = F)?
            </p>
            <p className="text-blue-400/60 text-xs italic mb-6">
              Errar é parte do raciocínio lógico. Volte ao quadro de pistas, refaça as contas e tente novamente.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setEtapa('briefing')}
                className="py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: 'rgba(96,165,250,0.1)',
                  border: '1px solid rgba(96,165,250,0.3)',
                  color: '#93c5fd',
                }}
              >
                Rever Briefing
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={tentarNovamente}
                className="py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: 'rgba(239,68,68,0.18)',
                  border: '1px solid rgba(239,68,68,0.45)',
                  color: '#fff',
                }}
              >
                Tentar Novamente →
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return null
}
