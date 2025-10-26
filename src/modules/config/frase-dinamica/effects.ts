export type EffectOption = { token: string; className: string; label: string }

export const EFFECT_OPTIONS: EffectOption[] = [
  { token: 'none',         className: '',                 label: 'Sem efeito' },
  { token: 'big',          className: 'effect-big',       label: 'Texto grande' },
  { token: 'italic',       className: 'effect-italic',    label: 'Itálico' },
  { token: 'underline',    className: 'effect-underline', label: 'Sublinhado' },
  { token: 'shadow',       className: 'effect-shadow',    label: 'Sombra' },
  { token: 'green',        className: 'effect-green',     label: 'Cor verde (destaque)' },

  { token: 'blink',        className: 'effect-blink',     label: 'Piscar' },
  { token: 'fade',         className: 'effect-fade',      label: 'Fade in' },
  { token: 'pulse',        className: 'effect-pulse',     label: 'Pulso' },
  { token: 'slide-left',   className: 'effect-slide-left',  label: 'Slide da esquerda' },
  { token: 'slide-right',  className: 'effect-slide-right', label: 'Slide da direita' },
  { token: 'rotate',       className: 'effect-rotate',    label: 'Rotação contínua' },
  { token: 'jump',         className: 'effect-jump',      label: 'Letras pulando' },
  { token: 'typewriter',   className: 'effect-typewriter',label: 'Digitando rápido' },
  { token: 'shake',        className: 'effect-shake',     label: 'Tremor rápido' },
  { token: 'slow-shake',   className: 'effect-slow-shake',label: 'Tremor lento' },
  { token: 'explode',      className: 'effect-explode',   label: 'Explosão de entrada' },
  { token: 'flash',        className: 'effect-flash',     label: 'Flash' },
  { token: 'speed',        className: 'effect-speed',     label: 'Entrada rápida' },
  { token: 'spin',         className: 'effect-spin',      label: 'Letras girando' },
]

// devolve a classe CSS correspondente ao token salvo no banco
export function effectTokenToClass(token?: string | null): string {
  if (!token) return ''
  return EFFECT_OPTIONS.find(e => e.token === token)?.className ?? ''
}
