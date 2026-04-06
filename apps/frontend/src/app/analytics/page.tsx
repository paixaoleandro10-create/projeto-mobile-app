import Link from "next/link";
import { RefreshButton } from "@/components/refresh-button";
import { getRecords, getSummary } from "@/lib/api";

export default async function AnalyticsPage() {
  const [records, summary] = await Promise.all([getRecords(), getSummary()]);

  return (
    <main id="main-content" className="container">
      <header className="hero compact">
        <p className="eyebrow">Analytics</p>
        <h1>Registros analíticos</h1>
        <p className="description">
          Listagem inicial para dashboard e relatório simples, pronta para ser conectada ao Supabase.
        </p>
      </header>

      <section className="toolbar" aria-label="Ações da página">
        <Link className="ghost-button" href="/">
          Voltar para início
        </Link>
        <RefreshButton />
      </section>

      <section aria-labelledby="summary-title" className="panel">
        <h2 id="summary-title">Resumo por categoria</h2>
        <ul className="summary-grid">
          {summary.map((item) => (
            <li className="summary-card" key={`${item.period}-${item.category}`}>
              <h3>{item.category}</h3>
              <p>
                <strong>{item.total_records}</strong> registros
              </p>
              <p>Média: {item.average_metric.toFixed(2)}</p>
              <p>Total: {item.total_metric.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="records-title" className="panel">
        <h2 id="records-title">Lista de dados</h2>
        <div className="table-wrapper" role="region" aria-label="Tabela de registros analíticos">
          <table>
            <caption className="visually-hidden">Registros analíticos mais recentes</caption>
            <thead>
              <tr>
                <th scope="col">Categoria</th>
                <th scope="col">Valor</th>
                <th scope="col">Fonte</th>
                <th scope="col">Status</th>
                <th scope="col">Data</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.category}</td>
                  <td>{record.metric_value.toFixed(2)}</td>
                  <td>{record.source}</td>
                  <td>{record.status}</td>
                  <td>{new Date(record.event_time).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
