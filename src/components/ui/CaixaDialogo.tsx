import { motion, AnimatePresence } from 'framer-motion'

interface CaixaDialogoProps {
  personagem: string | null
  texto: string
  tipo?: 'dialogo' | 'naracao'
}

export function CaixaDialogo({ personagem, texto, tipo = 'dialogo' }: CaixaDialogoProps) {
  const ehDetetive = personagem === 'Detetive Lógico'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={texto}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="caixa-dialogo p-5 md:p-6"
      >
        {tipo === 'naracao' ? (
          <p className="text-blue-200 italic text-base md:text-lg leading-relaxed font-light">
            {texto}
          </p>
        ) : (
          <>
            {personagem && (
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`font-bold text-base md:text-lg tracking-wide ${
                    ehDetetive ? 'text-blue-300' : 'text-white'
                  }`}
                >
                  {personagem}
                </span>
                <div
                  className={`flex-1 h-px ${ehDetetive ? 'bg-blue-400/40' : 'bg-white/25'}`}
                />
              </div>
            )}
            <p className="text-white/90 italic text-base md:text-lg leading-relaxed">
              "{texto}"
            </p>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
