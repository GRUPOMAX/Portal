// src/pages/LoginPage.tsx
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm'

export default function LoginPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 relative overflow-hidden">
      {/* fundo moderno */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-emerald-500"></div>
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-20 bg-cyan-500"></div>
        <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_70%_30%,rgba(16,185,129,0.15),transparent_60%)]"></div>
      </div>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <header className="mb-12 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Painel • <span className="text-emerald-400">Grupo Max</span>
            </h1>
            <p className="text-neutral-400 mt-2">Constantemente Atualizado com as novas aplicações</p>
          </header>

          <div className="mx-auto max-w-3xl grid md:grid-cols-2 gap-8 items-center">
            <div className="hidden md:block">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm shadow-2xl">
                <div className="relative h-56 rounded-xl bg-gradient-to-br from-emerald-400/20 via-cyan-400/10 to-transparent border border-white/10 overflow-hidden">
                  {/* leve aura de fundo para dar profundidade */}
                  <div className="absolute -inset-12 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.25),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.18),transparent_55%)] blur-2xl pointer-events-none" />

                  {/* logo central com animação */}
                  <div className="relative h-full grid place-items-center">
                      <svg
                        viewBox="0 0 1294 1195"
                        className="w-40 h-40 text-emerald-400 animate-stroke"
                        aria-hidden
                      >
                        <defs>
                          <style>{`
                            /* Traçado + preenchimento */
                            .st0{
                              fill:transparent;
                              stroke:currentColor;
                              stroke-width:6;
                              stroke-linecap:round;
                              stroke-linejoin:round;
                              /* pathLength=1000 em cada <path> → dash fixo */
                              stroke-dasharray:1000;
                              stroke-dashoffset:1000;
                              animation:
                                draw 3.6s ease-out infinite,
                                fillPulse 3.6s ease-in-out infinite;
                            }

                            /* Zoom no <g>, com origem correta pro SVG */
                            .zoom-wrap{
                              transform-box: fill-box;          /* crucial no Firefox/Chrome */
                              transform-origin: center;         /* centro do bbox do grupo   */
                              animation: zoomPulse 3.6s ease-out infinite;
                              will-change: transform;
                            }

                            /* 0–72% desenha; 72–97% pausado; 100% reseta */
                            @keyframes draw{
                              0%   { stroke-dashoffset:1000; }
                              72%  { stroke-dashoffset:0; }
                              97%  { stroke-dashoffset:0; }
                              100% { stroke-dashoffset:1000; }
                            }

                            /* Preenche perto do final e some no reset */
                            @keyframes fillPulse{
                              0%,70% { fill:transparent; }
                              82%,95%{ fill:currentColor; }
                              100%   { fill:transparent; }
                            }

                            /* Zoom visível no clímax, volta ao normal pra reiniciar suave */
                            @keyframes zoomPulse{
                              0%,78%  { transform:scale(1); }
                              92%     { transform:scale(1.18); } /* aumentei pra ficar perceptível */
                              100%    { transform:scale(1); }
                            }
                          `}</style>


                        </defs>
                      <g className="zoom-wrap">
                      <path className="st0" pathLength="1000" d="M317.2,673.6c-9.3-2.8-16.7-8.7-22.6-17.7l-5.4-8v-30.6c0-30.5,0-30.6,3.8-37.9,2.1-4.1,6.6-9.7,9.8-12.5,10.3-8.8,15.1-9.5,52.8-9.1,37.3.4,39.4,1,50,11.5,11.2,11.2,11.7,13.1,12.1,62.7.6,48.4,1.1,46-8.7,41.7-6.6-2.8-13.1-10.3-17.7-20.1-3.7-8.1-4-9.8-4.4-34.2-.3-14.1-1.1-26.8-1.9-28.1-1.3-2.3-4.3-2.6-31.9-2.6s-30.8.4-31.6,1.9c-1.7,2.6-2.1,48.3-.6,50.8,1,1.4,6.3,2.3,20.4,3,20.1,1.1,24.2,2,33.2,6.7,9.5,4.8,17.8,15.2,17.8,22.5s-65.9,2.7-75.2-.1h0Z"/>
                      <path className="st0" pathLength="1000" d="M425,670.7c2-12,16.2-22.2,34.9-25.1,6.1-.9,11.8-2.6,13.8-4.3,3.6-2.7,3.6-3,3.6-25.5v-22.6l-4.6-2.8c-2.6-1.6-7-2.8-9.8-2.8-7.4,0-18.4-3.7-25.5-8.4-6.7-4.4-12.8-13.2-12.8-18.2v-3.3h26.2q26.1,0,34.3,4.1c8.1,4.1,8.4,4.1,12,1.7,7.1-5,13-5.8,38.7-5.8s25.5.1,25.5,2.8c0,6.7-8.5,16.9-18.8,22.6-3,1.6-9.7,3.3-15,3.8-5.4.6-11.5,2.1-14,3.4l-4.3,2.4-.4,22.9c-.4,27.8-.3,27.9,15.9,29.5,17.9,1.9,34,13.1,36,25.5l.9,5.4-26.9-.6c-24.9-.4-27.5-.7-33.7-3.8-6-3-7.3-3.1-11.4-1.4-2.6,1-5.4,2.4-6.6,3.3-1.3,1-13,1.7-30.5,2.1l-28.5.4.9-5.4h0Z"/>
                      <path className="st0" pathLength="1000" d="M592.7,634.2c0-47.1.7-51.8,9.4-61.9,2.7-3.3,8.1-7.7,11.7-10l6.7-3.8,50.3-.4,50.1-.4v3.3c0,4.4-5.3,12.5-11.7,18.1-8.5,7.4-16.5,9-51,9.7-17.5.4-31.3,1.3-32.3,2.1s-1.9,3.7-1.9,6.3v4.8h68.4l-.9,4c-2.4,10.4-13.4,20.8-25.2,23.9-4.4,1.1-14.7,2-24.8,2h-17.4l-.9,5.4c-3.3,20.6-13.4,35.7-25.2,37.9l-5.4,1v-41.9h0Z"/>
                      <path className="st0" pathLength="1000" d="M728.9,630.9c0-37.7.3-42.9,2.8-51.1,3.1-10.3,10.3-19.5,17.7-23.1,10-4.7,9.4-7,9.4,41s-.4,44.4-2.1,49.4c-4.6,13-13.8,22.8-23.1,24.8l-4.7,1v-42h0Z"/>
                      <path className="st0" pathLength="1000" d="M801.7,671.8c-11.7-2.8-20.8-10.3-26.9-21.9l-3.7-6.8v-66.2c0-52,.4-66.1,1.9-66.1,4,.1,13.5,5.6,17.2,10.1,2.3,2.7,5.6,7.7,7.1,11.2,2.8,6,3,9.5,3.7,56,.7,47,.9,49.7,3.4,51.7,4.1,2.8,57.4,2.8,61.5,0,2.4-1.9,2.7-4.3,3.1-24.6.6-29.3,1-28.8-19.7-30.3-15.9-1.3-21.5-3-30.9-9.8-6.1-4.4-9.3-9.1-11-16.2l-1-4,32.5.4c36.2.4,37.2.7,47.8,11,11,10.3,11.7,12.8,12.1,46.3l.4,29.9-3.8,7.5c-5.6,11-15.8,19.7-25.9,21.6-8.7,1.7-61.1,1.9-67.9.3h0Z"/>
                      <path className="st0" pathLength="1000" d="M910.3,623.1l.4-43.9,4-8.1c4.7-9.5,13-17.2,22.1-20.2,8-2.8,65.6-3.3,74.3-.7,9.1,2.7,18.7,11.1,23.5,20.5,4.3,8.3,4.3,8.7,4.8,34.5l.4,26.1h-3.7c-12.5,0-25.1-16.9-27.2-36.6-1.7-15.8.9-14.7-34-14.7s-30.8.4-31.9,1.9c-.7.9-1.7,13.2-2,27.3-.6,22.1-1.1,26.8-3.8,33.9-4.3,11-14.5,21.8-21.9,23.1l-5.4.9.4-43.9h0Z"/>
                      <path className="st0" pathLength="1000" d="M1085,664.5c-8.7-2.6-19.4-12.2-23.5-21.2-3.1-6.7-3.4-8.7-3.4-35.6s.3-28.9,3.4-35.6c4.3-9.3,11.1-15.9,20.4-20.2,7.4-3.4,8.1-3.4,42-3l34.6.4,6.7,3.8c8.8,5.3,16.4,14.4,18.9,23.1,2.8,9.5,3.1,90.6.4,90.6-3.4-.1-13.2-5.3-16.4-8.7-1.7-1.9-4.8-7-7.1-11.2-3.8-7.5-4-8.7-4.7-35-.6-20.1-1.3-27.8-2.7-29.5-1.7-2.1-5.7-2.4-30-2.4s-28.3.1-31.9,3l-3.7,2.8v21.4q0,28.3,17.7,28.3c17.4,0,28.5,2,37.9,6.7,9.1,4.7,17.1,14.2,17.1,20.5v4.1h-34.5c-25.6-.1-36.3-.7-41.2-2.3h0Z"/>
                      <path className="st0" pathLength="1000" d="M107.5,607.6v-64.1h4.3c4.6,0,17.1,7.3,21.6,12.2,1.4,1.6,2.6,5.6,2.7,9.4l.4,6.7,5.3-4.8c8.8-8,16.4-11.1,28.3-11.8,13.2-.7,22.9,2.8,30.6,11.4l5.1,5.6,5.6-5c10.3-9.3,16.2-11.5,30.6-11.5s24.2,3.6,30.6,12.4c6.3,8.5,7.1,15.9,7.1,61.8v42l-15.2-.4-15.4-.4-.7-42c-.4-23.1-1.3-43.1-2-44.6-2.7-5.8-15.8-8.7-22.6-5.1-1.7,1-4.4,3-6.1,4.7-6.7,6.7-7,8.3-7.7,48.6l-.7,38.4-15.2.4-15.4.4v-38.2c0-20.9-.7-40.7-1.4-43.9-.7-3.3-3-7.1-5.1-9.1-5.6-4.7-16.7-3.8-23.5,1.9-9,7.5-9.1,7.7-9.5,50.4l-.4,38.7h-31.2v-64.1h0Z"/>
                      <path className="st0" pathLength="1000" d="M729.3,547.9c1.4-17.7,12.7-33.9,25.6-36.7q3.8-.9,3.8,6.7c0,19.8-13.5,39.4-27.1,39.4s-3.3-.4-2.4-9.4h0Z"/>
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="h-3 w-3/5 bg-white/10 rounded"></div>
                  <div className="h-3 w-4/5 bg-white/10 rounded"></div>
                  <div className="h-3 w-2/5 bg-white/10 rounded"></div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md shadow-2xl">
              <LoginForm onSuccess={() => navigate('/app', { replace: true })} />
            </div>
          </div>
        </div>
      </main>

      {/* rodapé fixado no final */}
      <footer className="text-center text-xs text-neutral-500 py-4">
        feito pelo <span className="text-emerald-400 font-medium">Jota</span>
      </footer>
    </div>
  )
}
