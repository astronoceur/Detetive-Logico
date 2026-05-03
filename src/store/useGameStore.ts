import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GameState {
  jogador: {
    nome: string
    volumeAudio: number
  }
  progresso: {
    narrativaVista: boolean
    faseAtual: number
    fasesConcluidas: number[]
    pistasColetadas: string[]
    desafioFinalConcluido: boolean
    acertouCulpado: boolean | null
  }
  ui: {
    cadernoAberto: boolean
    configuracoesAbertas: boolean
    dicasAbertas: boolean
    infoAberto: boolean
  }
}

interface GameActions {
  setNome: (nome: string) => void
  setVolume: (v: number) => void
  marcarNarrativaVista: () => void
  concluirFase: (id: number, pistaId: string) => void
  coletarPista: (pistaId: string) => void
  setDesafioFinal: (acertou: boolean) => void
  toggleCaderno: () => void
  toggleConfiguracoes: () => void
  toggleDicas: () => void
  toggleInfo: () => void
  resetarProgresso: () => void
}

const estadoInicial: GameState = {
  jogador: { nome: '', volumeAudio: 70 },
  progresso: {
    narrativaVista: false,
    faseAtual: 1,
    fasesConcluidas: [],
    pistasColetadas: [],
    desafioFinalConcluido: false,
    acertouCulpado: null,
  },
  ui: {
    cadernoAberto: false,
    configuracoesAbertas: false,
    dicasAbertas: false,
    infoAberto: false,
  },
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set) => ({
      ...estadoInicial,

      setNome: (nome) =>
        set((s) => ({ jogador: { ...s.jogador, nome } })),

      setVolume: (v) =>
        set((s) => ({ jogador: { ...s.jogador, volumeAudio: v } })),

      marcarNarrativaVista: () =>
        set((s) => ({
          progresso: { ...s.progresso, narrativaVista: true },
        })),

      concluirFase: (id, pistaId) =>
        set((s) => ({
          progresso: {
            ...s.progresso,
            fasesConcluidas: s.progresso.fasesConcluidas.includes(id)
              ? s.progresso.fasesConcluidas
              : [...s.progresso.fasesConcluidas, id],
            pistasColetadas: s.progresso.pistasColetadas.includes(pistaId)
              ? s.progresso.pistasColetadas
              : [...s.progresso.pistasColetadas, pistaId],
            faseAtual: Math.max(s.progresso.faseAtual, id + 1),
          },
        })),

      coletarPista: (pistaId) =>
        set((s) => ({
          progresso: {
            ...s.progresso,
            pistasColetadas: s.progresso.pistasColetadas.includes(pistaId)
              ? s.progresso.pistasColetadas
              : [...s.progresso.pistasColetadas, pistaId],
          },
        })),

      setDesafioFinal: (acertou) =>
        set((s) => ({
          progresso: {
            ...s.progresso,
            desafioFinalConcluido: true,
            acertouCulpado: acertou,
          },
        })),

      toggleCaderno: () =>
        set((s) => ({ ui: { ...s.ui, cadernoAberto: !s.ui.cadernoAberto } })),

      toggleConfiguracoes: () =>
        set((s) => ({
          ui: { ...s.ui, configuracoesAbertas: !s.ui.configuracoesAbertas },
        })),

      toggleDicas: () =>
        set((s) => ({ ui: { ...s.ui, dicasAbertas: !s.ui.dicasAbertas } })),

      toggleInfo: () =>
        set((s) => ({ ui: { ...s.ui, infoAberto: !s.ui.infoAberto } })),

      resetarProgresso: () =>
        set((s) => ({
          progresso: { ...estadoInicial.progresso },
          ui: { ...estadoInicial.ui },
          jogador: { ...s.jogador },
        })),
    }),
    {
      name: 'detetive_logico_save',
      partialize: (state) => ({
        jogador: state.jogador,
        progresso: state.progresso,
      }),
    }
  )
)
