import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

// === utils ===
function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

// === types ===
type Plan = { label?: string; price: number };

type Props = {
  buttonText?: string;
  plans?: Plan[];
  initialPercent?: number;
  defaultMode?: "discount" | "increase";
};

// === Portal para forçar o modal fora do header (evita stacking bug) ===
function ModalPortal({ children }: { children: React.ReactNode }) {
  const [el] = useState(() => document.createElement("div"));
  useEffect(() => {
    el.setAttribute("id", "percent-tester-portal");
    document.body.appendChild(el);
    return () => { document.body.removeChild(el); };
  }, [el]);
  return createPortal(children, el);
}

export default function PercentTester({
  buttonText = "Teste de porcentagem",
  plans = [
    { label: "Plano 99", price: 99 },
    { label: "Plano 129", price: 129 },
    { label: "Plano 169", price: 169 },
  ],
  initialPercent = 10,
  defaultMode = "discount",
}: Props) {
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState<number>(clamp(initialPercent));
  const [mode, setMode] = useState<"discount" | "increase">(defaultMode);
  const [round99, setRound99] = useState<boolean>(false);

  // bloquear scroll do body quando aberto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Esc para fechar
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function apply(price: number) {
    const factor = mode === "discount" ? 1 - percent / 100 : 1 + percent / 100;
    let final = price * factor;
    if (round99) final = Math.floor(final) + 0.99;
    return Number(final.toFixed(2));
  }

  const results = useMemo(
    () => plans.map((p) => {
      const final = apply(p.price);
      const diff = final - p.price;
      return { ...p, final, diff };
    }),
    [plans, percent, mode, round99]
  );

  function copy(text: string) { navigator.clipboard.writeText(text).catch(() => {}); }

  return (
    <div className="inline-block">
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-9 md:h-10 px-3 md:px-4 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300/40 shadow-sm"
      >
        % {buttonText}
      </button>

      {open && (
        <ModalPortal>
          {/* Backdrop + Container centralizado */}
          <div className="fixed inset-0 z-[9999]">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl rounded-2xl bg-neutral-900 text-neutral-100 shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                  <h2 className="text-lg font-semibold">Teste de porcentagem</h2>
                  <button
                    className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/5"
                    onClick={() => setOpen(false)}
                    aria-label="Fechar"
                    title="Fechar"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-5">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-3">
                      <label className="block text-sm font-medium">Porcentagem</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={percent}
                          onChange={(e) => setPercent(clamp(Number(e.target.value) || 0))}
                          className="w-24 h-10 px-3 rounded-lg border border-white/10 bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                          min={0} max={100} step={0.5}
                        />
                        <span className="text-sm text-neutral-400">%</span>
                      </div>
                      <input
                        type="range" min={0} max={100} step={0.5}
                        value={percent}
                        onChange={(e) => setPercent(clamp(Number(e.target.value)))}
                        className="w-full"
                      />
                      <div className="flex flex-wrap gap-2">
                        {[5, 10, 15, 20, 25, 30, 40, 50].map((p) => (
                          <button
                            key={p}
                            onClick={() => setPercent(p)}
                            className={`h-8 px-3 rounded-full border text-sm ${
                              percent === p
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "border-white/10 hover:bg-white/5"
                            }`}
                          >
                            {p}%
                          </button>
                        ))}
                        <button
                          onClick={() => setPercent(0)}
                          className="h-8 px-3 rounded-full border text-sm border-white/10 hover:bg-white/5"
                        >
                          Zerar
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium">Modo</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMode("discount")}
                          className={`flex-1 h-10 rounded-lg border text-sm font-medium ${
                            mode === "discount"
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "border-white/10 hover:bg-white/5"
                          }`}
                        >
                          Desconto
                        </button>
                        <button
                          onClick={() => setMode("increase")}
                          className={`flex-1 h-10 rounded-lg border text-sm font-medium ${
                            mode === "increase"
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "border-white/10 hover:bg-white/5"
                          }`}
                        >
                          Acréscimo
                        </button>
                      </div>

                      <label className="block text-sm font-medium mt-3">Arredondar</label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={round99}
                          onChange={(e) => setRound99(e.target.checked)}
                        />
                        Arredondar para x,99
                      </label>
                    </div>
                  </div>

                  {/* Tabela */}
                  <div className="overflow-hidden border border-white/10 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-800/60">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium">Plano</th>
                          <th className="text-right px-4 py-3 font-medium">Base</th>
                          <th className="text-right px-4 py-3 font-medium">{mode === "discount" ? "Desconto" : "Acréscimo"}</th>
                          <th className="text-right px-4 py-3 font-medium">Final</th>
                          <th className="px-2 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, idx) => (
                          <tr key={idx} className="border-t border-white/10">
                            <td className="px-4 py-3">{r.label ?? `Plano ${r.price}`}</td>
                            <td className="px-4 py-3 text-right tabular-nums">{brl(r.price)}</td>
                            <td className={`px-4 py-3 text-right tabular-nums ${r.diff < 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {r.diff < 0 ? "−" : "+"}{brl(Math.abs(r.diff))}
                              <span className="text-neutral-400"> ({percent}%)</span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold tabular-nums">{brl(r.final)}</td>
                            <td className="px-2 py-3 text-right">
                              <button
                                onClick={() => copy(brl(r.final))}
                                className="h-8 px-3 rounded-lg border border-white/10 hover:bg-white/5"
                                title="Copiar valor final"
                              >
                                Copiar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs text-neutral-400">
                    Dica: ative o arredondamento para padronizar preços em x,99. O valor é calculado com base no preço do plano e no percentual escolhido.
                  </p>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-2">
                  <button
                    className="h-10 px-4 rounded-xl border border-white/10 hover:bg-white/5"
                    onClick={() => setOpen(false)}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
