export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Gerador de Cupom</h1>
      <p className="opacity-80">Página inicial. Acesse o centro de configurações.</p>
      <a
        href="/config"
        className="inline-flex mt-6 h-10 px-4 items-center rounded-xl bg-emerald-600 hover:bg-emerald-500"
      >
        Abrir Configurações
      </a>
    </main>
  );
}
