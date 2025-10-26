// src/modules/config/frase-dinamica/EditPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { readRecord, updateRecord, createRecord } from '../lib/noco'
import type { FraseDinamica } from './types'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { EFFECT_OPTIONS, effectTokenToClass } from './effects'

const TABLE_ID = import.meta.env.VITE_TID_FRASE_DINAMICA as string

export default function EditPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState<Partial<FraseDinamica>>({})
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    if (!id) return
    ;(async () => {
      try {
        const data = await readRecord<FraseDinamica>(TABLE_ID, id)
        if (!alive) return
        setForm(data)
      } catch (err: any) {
        alert(err?.message || 'Falha ao carregar registro')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [id])

  async function handleSave() {
    if (!form.Part_Frase_Sem_Efeito || !form.Part_Frase_Com_Efeito) {
      alert('Preencha as partes da frase.')
      return
    }
    try {
      setSaving(true)
      if (id) {
        await updateRecord<FraseDinamica>(TABLE_ID, { Id: id, ...form })
      } else {
        await createRecord<FraseDinamica>(TABLE_ID, form)
      }
      navigate(-1)
    } catch (err: any) {
      alert(err?.message || 'Erro ao salvar registro')
    } finally {
      setSaving(false)
    }
  }

  const effectClass = useMemo(() => effectTokenToClass(form.Efeito as string), [form.Efeito])

  const previewStyle = useMemo<React.CSSProperties>(() => {
    const color = (form.colorTextAnimado || '').trim()
    return color ? { color } : {}
  }, [form.colorTextAnimado])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header sticky no mesmo padrão do Dashboard */}
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            {id ? 'Editar' : 'Nova'} Frase Dinâmica
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="h-9 px-3 rounded-lg bg-white/5 hover:bg-white/10 border-white/10"
            >
              Voltar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Card de contexto */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
          <p className="text-neutral-300">
            Edite as partes da frase, escolha um efeito e uma cor. O preview abaixo reflete as alterações em tempo real.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          {loading ? (
            <div className="text-neutral-300">Carregando…</div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm opacity-70 mb-1">Parte sem efeito</label>
                <input
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 h-10
                             focus:outline-none focus:ring-2 focus:ring-white/20"
                  value={form.Part_Frase_Sem_Efeito || ''}
                  onChange={(e) => setForm({ ...form, Part_Frase_Sem_Efeito: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm opacity-70 mb-1">Parte com efeito</label>
                <input
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 h-10
                             focus:outline-none focus:ring-2 focus:ring-white/20"
                  value={form.Part_Frase_Com_Efeito || ''}
                  onChange={(e) => setForm({ ...form, Part_Frase_Com_Efeito: e.target.value })}
                />
              </div>

              {/* SELECT de efeitos */}
              <div>
                <label className="block text-sm opacity-70 mb-1">Efeito</label>
                <select
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 h-10
                             focus:outline-none focus:ring-2 focus:ring-white/20"
                  value={form.Efeito || 'none'}
                  onChange={(e) => setForm({ ...form, Efeito: e.target.value })}
                >
                  {EFFECT_OPTIONS.map(opt => (
                    <option key={opt.token} value={opt.token}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-xs opacity-60 mt-1">
                  Salvamos apenas o token (ex.: <code>{form.Efeito || 'none'}</code>) no banco.
                </p>
              </div>

              {/* COR: texto + picker sincronizados */}
              <div>
                <label className="block text-sm opacity-70 mb-1">Cor (RGB/HEX)</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-neutral-900 border border-white/10 rounded-lg px-3 h-10
                               focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="ex.: rgb(3, 196, 3) ou #03c403"
                    value={form.colorTextAnimado || ''}
                    onChange={(e) => setForm({ ...form, colorTextAnimado: e.target.value })}
                  />
                  <input
                    type="color"
                    className="w-12 h-10 rounded-lg border border-white/10 bg-neutral-900
                               overflow-hidden"
                    value={toColorHex(form.colorTextAnimado)}
                    onChange={(e) => setForm({ ...form, colorTextAnimado: e.target.value })}
                    title="Seletor de cor"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-sm opacity-70 mb-2">Preview</p>
          <div className="text-xl">
            <span className="opacity-80 mr-2">
              {form.Part_Frase_Sem_Efeito || 'Parte sem efeito'}
            </span>
            <span className={effectClass || ''} style={previewStyle}>
              {wrapPerEffect(form.Part_Frase_Com_Efeito || 'Parte com efeito', form.Efeito)}
            </span>
          </div>

          <div className="mt-4 text-xs opacity-60">
            Efeito ativo: <code>{form.Efeito || 'none'}</code>
          </div>
        </div>

        {/* Ações no rodapé (mobile-friendly) */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="h-9 px-3 rounded-lg bg-white/5 hover:bg-white/10 border-white/10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </main>
    </div>
  )
}

/** Helpers locais **/

// converte texto rgb(...) para hex quando possível; se já for hex, retorna como está.
function toColorHex(input?: string): string {
  if (!input) return '#ffffff'
  const s = input.trim()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return s
  const m = s.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i)
  if (!m) return '#ffffff'
  const [r,g,b] = m.slice(1,4).map(n => Math.max(0, Math.min(255, parseInt(n,10))))
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('')
}

// certos efeitos operam por-letra (jump/spin/typewriter). Isto envolve cada letra em <span>.
function wrapPerEffect(text: string, token?: string) {
  const perLetter = new Set(['jump','spin'])
  if (!token || !perLetter.has(token)) return text
  return (
    <>
      {text.split('').map((ch, i) => <span key={i}>{ch}</span>)}
    </>
  )
}
