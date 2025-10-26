import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
  useReducer,
} from 'react';
import { readRecord, updateRecord } from '../lib/noco';
import { useNavigate, useParams } from 'react-router-dom';
import type { PlanosEmpresariais } from './types';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Loader2, RefreshCcw } from 'lucide-react';

const TABLE_ID = import.meta.env.VITE_TID_PLANOS_EMPRESARIAIS as string;

type PlanoKey = keyof Pick<PlanosEmpresariais, 'Plano_Startup' | 'Plano_Medium' | 'Plano_Big'>;

const BASE_FIELDS = ['Tecnologia', 'Modem', 'IP', 'Valor', 'Tempo_de_SLA', 'Suporte'] as const;

type PlanoData = Record<string, any>;

interface FormState {
  Plano_Startup: PlanoData;
  Plano_Medium: PlanoData;
  Plano_Big: PlanoData;
}

type FormAction =
  | { type: 'INIT'; payload: Partial<FormState> }
  | { type: 'UPDATE_FIELD'; plano: PlanoKey; key: string; value: string };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'INIT': {
      return {
        Plano_Startup: { ...(action.payload.Plano_Startup ?? {}) },
        Plano_Medium: { ...(action.payload.Plano_Medium ?? {}) },
        Plano_Big: { ...(action.payload.Plano_Big ?? {}) },
      };
    }
    case 'UPDATE_FIELD': {
      return {
        ...state,
        [action.plano]: {
          ...state[action.plano],
          [action.key]: action.value,
        },
      };
    }
    default:
      return state;
  }
}

const InputRow = React.memo(function InputRow({
  value,
  onChange,
  label,
  placeholder,
  name,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  name: string;
  id: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs opacity-70">{label || name}</span>
      <input
        id={id}
        type="text"
        autoComplete="off"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
      />
    </label>
  );
});

function useKeepFocus() {
  const last = useRef<{ id: string; selStart: number | null } | null>(null);
  const restoreTimeout = useRef<NodeJS.Timeout | null>(null);

  useLayoutEffect(() => {
    const el = document.activeElement as HTMLInputElement | null;
    if (el && el.tagName === 'INPUT' && el.id) {
      last.current = { id: el.id, selStart: el.selectionStart };
    }
    return () => {
      if (restoreTimeout.current) clearTimeout(restoreTimeout.current);
    };
  });

  useLayoutEffect(() => {
    if (!last.current) return;
    if (restoreTimeout.current) clearTimeout(restoreTimeout.current);

    restoreTimeout.current = setTimeout(() => {
      const el = document.getElementById(last.current!.id) as HTMLInputElement | null;
      if (el && document.activeElement !== el) {
        el.focus({ preventScroll: true });
        const pos = last.current!.selStart ?? el.value.length;
        try {
          el.setSelectionRange(pos, pos);
        } catch {}
      }
    }, 10);

    return () => {
      if (restoreTimeout.current) clearTimeout(restoreTimeout.current);
    };
  }, []);

  return () => {
    last.current = null;
    if (restoreTimeout.current) clearTimeout(restoreTimeout.current);
  };
}

/** Cartão de edição de um conjunto de plano */
function PlanoCard({
  title,
  planoKey,
  plano,
  handlers,
}: {
  title: string;
  planoKey: PlanoKey;
  plano: PlanoData;
  handlers: Record<string, (value: string) => void>;
}) {
  const extraKeys = useMemo(() => {
    const keys = Object.keys(plano ?? {}).filter((k) => !BASE_FIELDS.includes(k as any));
    keys.sort();
    return keys;
  }, [plano]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6 backdrop-blur-md shadow-sm space-y-4">
      <h2 className="text-base font-semibold text-white/90">{title}</h2>
      <div className="grid gap-3">
        <InputRow id={`${planoKey}-Tecnologia`} name="Tecnologia" value={String(plano?.Tecnologia ?? '')} onChange={handlers.Tecnologia} />
        <InputRow id={`${planoKey}-Modem`} name="Modem" value={String(plano?.Modem ?? '')} onChange={handlers.Modem} />
        <InputRow id={`${planoKey}-IP`} name="IP" value={String(plano?.IP ?? '')} onChange={handlers.IP} />
        <InputRow id={`${planoKey}-Valor`} name="Valor" placeholder="R$ 0,00" value={String(plano?.Valor ?? '')} onChange={handlers.Valor} />
        <InputRow id={`${planoKey}-Tempo_de_SLA`} name="Tempo_de_SLA" label="Tempo de SLA" value={String(plano?.Tempo_de_SLA ?? '')} onChange={handlers.Tempo_de_SLA} />
        <InputRow id={`${planoKey}-Suporte`} name="Suporte" value={String(plano?.Suporte ?? '')} onChange={handlers.Suporte} />
      </div>

      {extraKeys.length > 0 && (
        <div className="pt-2 border-t border-white/10 space-y-3">
          <p className="text-xs font-medium opacity-70">Outros campos</p>
          <div className="grid gap-3">
            {extraKeys.map((k, index) => (
              <InputRow
                key={`${planoKey}-${k}-${index}`}
                id={`${planoKey}-${k}-${index}`}
                name={k}
                value={String((plano as any)?.[k] ?? '')}
                onChange={handlers[k]}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function EditPage() {
  useKeepFocus();

  const { id } = useParams();
  const navigate = useNavigate();

  const [form, dispatch] = useReducer(formReducer, {
    Plano_Startup: {},
    Plano_Medium: {},
    Plano_Big: {},
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reuso: carrega do NocoDB e aplica no reducer
  const loadRecord = useCallback(async () => {
    if (!id) return;
    const data = await readRecord<PlanosEmpresariais>(TABLE_ID, id);
    dispatch({
      type: 'INIT',
      payload: {
        Plano_Startup: (data as any)?.Plano_Startup ?? {},
        Plano_Medium: (data as any)?.Plano_Medium ?? {},
        Plano_Big: (data as any)?.Plano_Big ?? {},
      },
    });
  }, [id]);

  // Primeira carga
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError(null);
        await loadRecord();
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || 'Falha ao carregar registro');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadRecord]);

  const setPlanoField = useCallback(
    (plano: PlanoKey, key: string, value: string) => {
      dispatch({ type: 'UPDATE_FIELD', plano, key, value });
    },
    []
  );

  // Handlers indexados por plano
  const onChangeHandlers = useMemo(() => {
    const map: Record<PlanoKey, Record<string, (value: string) => void>> = {
      Plano_Startup: {},
      Plano_Medium: {},
      Plano_Big: {},
    };

    (['Plano_Startup', 'Plano_Medium', 'Plano_Big'] as PlanoKey[]).forEach((planoKey) => {
      BASE_FIELDS.forEach((field) => {
        map[planoKey][field] = (value: string) => setPlanoField(planoKey, field, value);
      });
      const planoData = (form as FormState)[planoKey] || {};
      Object.keys(planoData)
        .filter((k) => !BASE_FIELDS.includes(k as any))
        .sort()
        .forEach((key) => {
          map[planoKey][key] = (value: string) => setPlanoField(planoKey, key, value);
        });
    });

    return map;
  }, [form, setPlanoField]);

  async function manualRefresh() {
    if (!id) return;
    try {
      setIsRefreshing(true);
      setError(null);
      await loadRecord();
    } catch (e: any) {
      setError(e?.message || 'Falha ao atualizar dados');
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleSave() {
    if (!id) return;
    try {
      setSaving(true);
      setError(null);

      await updateRecord<PlanosEmpresariais>(TABLE_ID, {
        Id: /^\d+$/.test(String(id)) ? Number(id) : id,
        Plano_Startup: form.Plano_Startup,
        Plano_Medium: form.Plano_Medium,
        Plano_Big: form.Plano_Big,
      });

      navigate(-1);
    } catch (e: any) {
      setError(e?.message || 'Não foi possível salvar as alterações');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Editar Planos</h2>
            <div className="h-9 w-24 rounded-lg bg-white/10 animate-pulse" />
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-10 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md">
            Carregando…
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <h2 className="text-lg font-semibold tracking-tight">Editar Planos Empresariais</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={manualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-60"
              title="Atualizar agora"
            >
              <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              Atualizar
            </button>

            <Button
              onClick={handleSave}
              variant="primary"
              disabled={saving}
              className="inline-flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? 'Salvando…' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-2">Conjuntos de planos</h3>
          <p className="text-neutral-300">
            Edite abaixo os detalhes dos planos. Campos extras do NocoDB aparecem em “Outros campos”.
          </p>
          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <PlanoCard title="Plano Startup" planoKey="Plano_Startup" plano={form.Plano_Startup} handlers={onChangeHandlers.Plano_Startup} />
          <PlanoCard title="Plano Medium" planoKey="Plano_Medium" plano={form.Plano_Medium} handlers={onChangeHandlers.Plano_Medium} />
          <PlanoCard title="Plano Big" planoKey="Plano_Big" plano={form.Plano_Big} handlers={onChangeHandlers.Plano_Big} />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={saving}
            className="inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? 'Salvando…' : 'Salvar Alterações'}
          </Button>
        </div>
      </main>
    </div>
  );
}
