import Link from "next/link";

export default function HomePage() {
  return (
    <main id="main-content" className="container">
      <header className="hero">
        <p className="eyebrow">Foundation MVP</p>
        <h1>Painel analitico orientado a dados</h1>
        <p className="description">
          Base inicial com arquitetura em camadas, API documentada e foco em robustez para evolucao
          continua.
        </p>
      </header>

      <section aria-labelledby="start-here" className="panel">
        <h2 id="start-here">Primeiros passos</h2>
        <p>
          Acesse a listagem de registros e os resumos analiticos para validar o fluxo ponta a ponta
          entre frontend e backend.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link className="action-button" href="/analytics">
            Ver dados analiticos
          </Link>
          <Link className="ghost-button" href="/mobile">
            Abrir frontend mobile integrado
          </Link>
        </div>
      </section>
    </main>
  );
}
