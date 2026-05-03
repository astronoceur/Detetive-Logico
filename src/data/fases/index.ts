// Índice central de fases.
// Para adicionar uma nova fase: crie faseXX.json nesta pasta
// e importe-a aqui seguindo o padrão abaixo.

export interface FaseData {
  id: number
  titulo: string
  conceito: {
    titulo: string
    texto: string
    pilarPC: string
    pilarDescricao?: string
  }
  personagem: string
  cenario: string
  narracaoEntrada: string
  dialogos: {
    primeiro: Array<{ personagem: string; fala: string }>
    segundo: Array<{ personagem: string; fala: string }>
  }
  traducaoLogica: string
  desafio: {
    enunciado: string
    pergunta?: string
    tipo: 'tabela_verdade' | 'tabela_classificacao' | 'multipla_escolha' | 'tabela_conectivos' | 'tabela_verdade_interativa'
    estrutura: {
      colunas: string[]
      linhas: Array<Array<string | null>>
      respostaCorreta: string[]
      colunasPreenchidas?: number
    }
    respostaFinal?: number | string
    numOpcoes?: number
    opcoesPerguntaFinal?: string[]
  }
  feedback: {
    acerto: {
      titulo: string
      mensagem: string
      pistaLiberada: string
    }
    erro: {
      titulo: string
      dica: string
    }
  }
  pista: {
    id: string
    categoria: 'horarios' | 'acessos' | 'falhas_sistema' | 'contradicoes'
    titulo: string
    descricao: string
  }
}

// Fases serão importadas dinamicamente conforme forem adicionadas
// Exemplo de uso:
//   const faseData = await import(`./fase${String(id).padStart(2,'0')}.json`)

export async function carregarFase(id: number): Promise<FaseData | null> {
  try {
    const modulo = await import(/* @vite-ignore */ `./${String(id).padStart(2, '0')}.json`)
    return modulo.default as FaseData
  } catch {
    return null
  }
}
