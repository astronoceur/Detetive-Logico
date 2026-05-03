import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { Modal } from '../components/ui/Modal'

const varianteItem = {
  hidden: { opacity: 0, x: -24 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.3 + i * 0.12, duration: 0.4 },
  }),
}

export function MenuPrincipal() {
  const navigate = useNavigate()
  const nome = useGameStore((s) => s.jogador.nome)
  const volumeAudio = useGameStore((s) => s.jogador.volumeAudio)
  const progresso = useGameStore((s) => s.progresso)
  const setVolume = useGameStore((s) => s.setVolume)
  const resetarProgresso = useGameStore((s) => s.resetarProgresso)
  const setNome = useGameStore((s) => s.setNome)

  const [configAberto, setConfigAberto] = useState(false)
  const [dicasAberto, setDicasAberto] = useState(false)
  const [infoAberto, setInfoAberto] = useState(false)
  const [confirmarReset, setConfirmarReset] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'manual' | 'glossario' | 'creditos'>('manual')

  const temProgresso =
    progresso.narrativaVista || progresso.fasesConcluidas.length > 0

  function handleComecar() {
    if (!progresso.narrativaVista) {
      navigate('/narrativa')
    } else {
      navigate('/hub')
    }
  }

  function handleReset() {
    if (confirmarReset) {
      resetarProgresso()
      setNome('')
      setConfirmarReset(false)
      setConfigAberto(false)
      navigate('/', { replace: true })
    } else {
      setConfirmarReset(true)
    }
  }

  return (
    <div className="relative w-full h-full flex overflow-hidden">
      {/* Fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/cenarios/menu.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Detetive Lógico — figura presente na cena */}
      <motion.img
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        src="/assets/personagens/detetive_logico.png"
        alt="Detetive Lógico"
        className="absolute bottom-0 z-[5] pointer-events-none select-none"
        style={{
          height: '92vh',
          width: 'auto',
          objectFit: 'contain',
          right: '18%',
          filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.7))',
        }}
        draggable={false}
      />

      {/* Botão de informações — canto superior direito */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        onClick={() => setInfoAberto(true)}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-all group"
        aria-label="Informações"
      >
        <span className="text-sm font-semibold opacity-70 group-hover:opacity-100 transition-opacity">
          Informações
        </span>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
          style={{
            background: 'rgba(96, 165, 250, 0.15)',
            border: '1.5px solid rgba(96, 165, 250, 0.4)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
        </div>
      </motion.button>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col justify-center h-full px-10 md:px-16 max-w-xl">
        {/* Saudação */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-blue-300/70 text-sm font-semibold uppercase tracking-widest mb-2"
        >
          Bem-vindo, Detetive {nome}
        </motion.p>

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-2"
        >
          <h1 className="font-titulo text-6xl md:text-7xl font-bold text-white text-sombra leading-none">
            Detetive
          </h1>
          <h1 className="font-titulo text-6xl md:text-7xl font-bold text-blue-400 text-sombra leading-none">
            Lógico
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="text-white/50 italic text-base mb-8"
        >
          O Caso do Módulo Atlas
        </motion.p>

        {/* Nome do jogador */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="flex items-center gap-2 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-blue-200 text-sm font-medium">{nome}</span>
          {temProgresso && (
            <span className="text-blue-400/60 text-xs ml-1">
              · {progresso.fasesConcluidas.length}/13 fases
            </span>
          )}
        </motion.div>

        {/* Seta decorativa 1 */}
        <motion.div
          custom={0}
          variants={varianteItem}
          initial="hidden"
          animate="visible"
        >
          <SetaDecorativa />
        </motion.div>

        {/* Botão Começar / Continuar */}
        <motion.button
          custom={0}
          variants={varianteItem}
          initial="hidden"
          animate="visible"
          onClick={handleComecar}
          whileHover={{ x: 6 }}
          className="btn-menu mb-1"
        >
          <span className="flex items-center gap-3">
            <span className="text-blue-400">▶</span>
            {temProgresso ? 'Continuar Investigação' : 'Iniciar Investigação'}
          </span>
        </motion.button>

        {/* Seta decorativa 2 */}
        <motion.div
          custom={1}
          variants={varianteItem}
          initial="hidden"
          animate="visible"
          className="ml-6"
        >
          <SetaDecorativa />
        </motion.div>

        {/* Configurações */}
        <motion.button
          custom={1}
          variants={varianteItem}
          initial="hidden"
          animate="visible"
          onClick={() => setConfigAberto(true)}
          whileHover={{ x: 6 }}
          className="btn-menu mb-1"
        >
          <span className="flex items-center gap-3">
            <span className="text-blue-400">⚙</span>
            Configurações
          </span>
        </motion.button>

        {/* Seta decorativa 3 */}
        <motion.div
          custom={2}
          variants={varianteItem}
          initial="hidden"
          animate="visible"
          className="ml-12"
        >
          <SetaDecorativa />
        </motion.div>

        {/* Dicas */}
        <motion.button
          custom={2}
          variants={varianteItem}
          initial="hidden"
          animate="visible"
          onClick={() => setDicasAberto(true)}
          whileHover={{ x: 6 }}
          className="btn-menu"
        >
          <span className="flex items-center gap-3">
            <span className="text-blue-400">📖</span>
            Dicas & Glossário
          </span>
        </motion.button>
      </div>

      {/* Modal Informações */}
      <Modal aberto={infoAberto} onFechar={() => setInfoAberto(false)} titulo="Sobre o Caso">
        <div className="space-y-3 text-sm">
          <div
            className="rounded-lg px-4 py-3"
            style={{ background: 'rgba(96, 165, 250, 0.08)', border: '1px solid rgba(96,165,250,0.2)' }}
          >
            <p className="text-blue-300 font-semibold mb-1">O Crime</p>
            <p className="text-blue-100/80 leading-relaxed">
              Na noite de quinta-feira, às 22h40, o Módulo Atlas — um dispositivo criptográfico com
              algoritmo proprietário de detecção de fraudes — foi roubado da Nexum Data Solutions.
            </p>
          </div>
          <div
            className="rounded-lg px-4 py-3"
            style={{ background: 'rgba(96, 165, 250, 0.08)', border: '1px solid rgba(96,165,250,0.2)' }}
          >
            <p className="text-blue-300 font-semibold mb-1">Jogador</p>
            <p className="text-blue-100/80">
              Detetive: <span className="text-white font-semibold">{nome}</span>
            </p>
            <p className="text-blue-100/80 mt-1">
              Pistas coletadas:{' '}
              <span className="text-white font-semibold">{progresso.pistasColetadas.length}/13</span>
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal Configurações */}
      <Modal
        aberto={configAberto}
        onFechar={() => {
          setConfigAberto(false)
          setConfirmarReset(false)
        }}
        titulo="Configurações"
      >
        <div className="space-y-6">
          {/* Volume */}
          <div>
            <label className="block text-sm font-semibold text-blue-300 mb-2">
              Volume de Áudio: {volumeAudio}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={volumeAudio}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Reset */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-sm text-blue-300/70 mb-3">Zona de Perigo</p>
            <AnimatePresence mode="wait">
              {!confirmarReset ? (
                <motion.button
                  key="reset-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfirmarReset(true)}
                  className="w-full text-left px-4 py-3 rounded-xl text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors text-sm font-medium"
                >
                  Resetar Progresso
                </motion.button>
              ) : (
                <motion.div
                  key="confirm-reset"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <p className="text-red-300 text-sm font-medium">
                    Tem certeza? Isso apaga todas as pistas e desafios resolvidos.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-red-700 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      Sim, Apagar Tudo
                    </button>
                    <button
                      onClick={() => setConfirmarReset(false)}
                      className="flex-1 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Modal>

      {/* Modal Dicas */}
      <Modal
        aberto={dicasAberto}
        onFechar={() => setDicasAberto(false)}
        titulo="Dicas & Glossário"
        largura="max-w-2xl"
      >
        {/* Abas */}
        <div className="flex gap-2 mb-5 border-b border-white/10 pb-3">
          {(['manual', 'glossario', 'creditos'] as const).map((aba) => (
            <button
              key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                abaAtiva === aba
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-300/70 hover:text-blue-200 hover:bg-white/5'
              }`}
            >
              {aba === 'manual' ? 'Como Jogar' : aba === 'glossario' ? 'Glossário Lógico' : 'Créditos'}
            </button>
          ))}
        </div>

        <div className="max-h-80 overflow-y-auto scrollbar-thin pr-2">
          {abaAtiva === 'manual' && <ConteudoManual />}
          {abaAtiva === 'glossario' && <ConteudoGlossario />}
          {abaAtiva === 'creditos' && <ConteudoCreditos />}
        </div>
      </Modal>
    </div>
  )
}

function SetaDecorativa() {
  return (
    <svg width="32" height="16" viewBox="0 0 32 16" fill="none" className="my-1 opacity-40">
      <path d="M2 8 Q10 4 20 8 Q26 10 30 8" stroke="#60a5fa" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M27 5 L30 8 L27 11" stroke="#60a5fa" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ConteudoManual() {
  const passos = [
    { n: '1', t: 'Entreviste os suspeitos', d: 'Cada localização no mapa esconde um suspeito com depoimentos para analisar.' },
    { n: '2', t: 'Colete pistas', d: 'Resolva o desafio de lógica de cada fase para liberar uma pista investigativa.' },
    { n: '3', t: 'Resolva os desafios', d: 'Complete tabelas-verdade e classifique proposições para avançar.' },
    { n: '4', t: 'Acuse o culpado', d: 'Com todas as 13 pistas, aplique a fórmula Culpado(x) para identificar o ladrão.' },
  ]

  return (
    <div className="space-y-3">
      {passos.map((p) => (
        <div
          key={p.n}
          className="flex gap-3 rounded-lg p-3"
          style={{ background: 'rgba(96, 165, 250, 0.06)', border: '1px solid rgba(96,165,250,0.12)' }}
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-blue-300 flex-shrink-0"
            style={{ background: 'rgba(96, 165, 250, 0.15)' }}
          >
            {p.n}
          </span>
          <div>
            <p className="text-white font-semibold text-sm">{p.t}</p>
            <p className="text-blue-200/70 text-xs mt-0.5">{p.d}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ConteudoGlossario() {
  const items = [
    { op: '∧', nome: 'Conjunção (E)', desc: 'p ∧ q é V somente quando ambas são V.', tabela: 'V∧V=V, V∧F=F, F∧V=F, F∧F=F' },
    { op: '∨', nome: 'Disjunção (OU)', desc: 'p ∨ q é F somente quando ambas são F.', tabela: 'V∨V=V, V∨F=V, F∨V=V, F∨F=F' },
    { op: '→', nome: 'Condicional (SE...ENTÃO)', desc: 'p → q é F apenas quando p=V e q=F.', tabela: 'V→V=V, V→F=F, F→V=V, F→F=V' },
    { op: '↔', nome: 'Bicondicional (SSE)', desc: 'p ↔ q é V quando p e q têm o mesmo valor.', tabela: 'V↔V=V, V↔F=F, F↔V=F, F↔F=V' },
    { op: '¬', nome: 'Negação (NÃO)', desc: '¬p inverte o valor de p.', tabela: '¬V=F, ¬F=V' },
  ]

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.op}
          className="rounded-lg p-3"
          style={{ background: 'rgba(96, 165, 250, 0.06)', border: '1px solid rgba(96,165,250,0.12)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-blue-300 w-7 text-center">{item.op}</span>
            <span className="text-white font-semibold text-sm">{item.nome}</span>
          </div>
          <p className="text-blue-200/70 text-xs">{item.desc}</p>
          <p className="text-blue-300/50 text-xs mt-1 font-mono">{item.tabela}</p>
        </div>
      ))}
    </div>
  )
}

function ConteudoCreditos() {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-blue-300 font-semibold mb-1">Projeto Educacional</p>
        <p className="text-blue-100/70">
          Detetive Lógico foi desenvolvido como jogo sério para o ensino de Lógica Proposicional
          em disciplinas de Matemática Discreta.
        </p>
      </div>
      <div>
        <p className="text-blue-300 font-semibold mb-1">Base Pedagógica</p>
        <p className="text-blue-100/70">
          Integra os quatro pilares do Pensamento Computacional: Decomposição, Reconhecimento de Padrões,
          Abstração e Algoritmos.
        </p>
      </div>
      <div>
        <p className="text-blue-300 font-semibold mb-1">Referências</p>
        <p className="text-blue-100/70">
          ROSEN, K. H. Matemática Discreta e suas Aplicações. 7ª ed.
        </p>
      </div>
    </div>
  )
}
