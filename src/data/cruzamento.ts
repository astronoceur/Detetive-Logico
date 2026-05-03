export type Nivel = 'baixo' | 'medio' | 'alto' | 'neutro'

export interface AvaliacaoSuspeito {
  id: string
  nome: string
  acesso: { texto: string; nivel: Nivel }
  mentiraComprovada: { texto: string; nivel: Nivel }
  motivoClaro: { texto: string; nivel: Nivel }
  inconsistenciaForte: { texto: string; nivel: Nivel }
  destaque?: boolean
}

export const cruzamento: AvaliacaoSuspeito[] = [
  {
    id: 'helena_duarte',
    nome: 'Helena Duarte',
    acesso: { texto: 'Indireto (sala distante)', nivel: 'baixo' },
    mentiraComprovada: { texto: 'Sim (e-mails)', nivel: 'medio' },
    motivoClaro: { texto: 'Médio', nivel: 'medio' },
    inconsistenciaForte: { texto: 'Apenas tempo morto', nivel: 'baixo' },
  },
  {
    id: 'marcos_teles',
    nome: 'Marcos Teles',
    acesso: { texto: 'Sim (saiu do monitoramento)', nivel: 'medio' },
    mentiraComprovada: { texto: 'Não', nivel: 'baixo' },
    motivoClaro: { texto: 'Médio (rivalidade)', nivel: 'medio' },
    inconsistenciaForte: { texto: 'Não', nivel: 'baixo' },
  },
  {
    id: 'renata_mota',
    nome: 'Renata Mota',
    acesso: { texto: 'DIRETO (laboratório)', nivel: 'alto' },
    mentiraComprovada: { texto: 'SIM (banheiro × biometria)', nivel: 'alto' },
    motivoClaro: { texto: 'ALTO (autoria do Atlas)', nivel: 'alto' },
    inconsistenciaForte: { texto: 'BIOMETRIA + LAB', nivel: 'alto' },
    destaque: true,
  },
  {
    id: 'diego_sampaio',
    nome: 'Diego Sampaio',
    acesso: { texto: 'Indireto (painel elétrico)', nivel: 'medio' },
    mentiraComprovada: { texto: 'Não', nivel: 'baixo' },
    motivoClaro: { texto: 'Médio (dívidas)', nivel: 'medio' },
    inconsistenciaForte: { texto: 'Apenas coincidência', nivel: 'baixo' },
  },
  {
    id: 'clara_viana',
    nome: 'Clara Viana',
    acesso: { texto: 'Não (recepção)', nivel: 'baixo' },
    mentiraComprovada: { texto: 'Não', nivel: 'baixo' },
    motivoClaro: { texto: 'Baixo', nivel: 'baixo' },
    inconsistenciaForte: { texto: 'Não', nivel: 'baixo' },
  },
  {
    id: 'eduardo_leal',
    nome: 'Eduardo Leal',
    acesso: { texto: 'Possível (blackout)', nivel: 'medio' },
    mentiraComprovada: { texto: 'Tautologias vagas', nivel: 'medio' },
    motivoClaro: { texto: 'Alto', nivel: 'alto' },
    inconsistenciaForte: { texto: 'Defesa fraca, não confissão', nivel: 'medio' },
  },
]

export type CategoriaPista = 'horarios' | 'acessos' | 'falhas_sistema' | 'contradicoes'

export const CATEGORIAS: Record<CategoriaPista, { label: string; icon: string; cor: string }> = {
  horarios: { label: 'Horários', icon: '⏱', cor: '#fbbf24' },
  acessos: { label: 'Acessos Físicos', icon: '🚪', cor: '#60a5fa' },
  falhas_sistema: { label: 'Falhas no Sistema', icon: '⚠', cor: '#a78bfa' },
  contradicoes: { label: 'Contradições', icon: '⚖', cor: '#fca5a5' },
}