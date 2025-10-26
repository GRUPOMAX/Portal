export type RespostaItem = {
  Resposta_Pergunta: string
}

export type PerguntaItem = {
  Pergunta: string
  Resposta: RespostaItem[] // sempre array (primeiro item é o texto)
}

export type DuvidaGrupo = {
  Numero_Pergunta: string
  Perguntas: PerguntaItem[]
}
