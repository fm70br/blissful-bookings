import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import {
  FUNCIONARIO_LOGADO_ID,
  departamentoDoFuncionario,
  formatarData,
  funcionariosDoDepartamento,
  getFuncionario,
  horariosDoDia,
  massagistaDoDepartamento,
  nomeDiaSemana,
} from "@/lib/massagem";
import { useAgendamentos } from "@/lib/agenda-store";

export const Route = createFileRoute("/impressao/$data")({
  head: () => ({
    meta: [
      { title: "Lista de sessões do dia | Agenda de Massagem" },
      {
        name: "description",
        content: "Lista impressa com os horários das sessões de massagem e os nomes dos funcionários do dia.",
      },
      { property: "og:title", content: "Lista de sessões do dia | Agenda de Massagem" },
      {
        property: "og:description",
        content: "Relação diária de horários e funcionários agendados para a massagem.",
      },
    ],
  }),
  component: Impressao,
});

function Impressao() {
  const { data } = Route.useParams();
  const agendamentos = useAgendamentos();
  const funcionario = getFuncionario(FUNCIONARIO_LOGADO_ID);
  const departamento = departamentoDoFuncionario(funcionario);
  const massagista = massagistaDoDepartamento(departamento);
  const pessoas = funcionariosDoDepartamento(departamento.id_dep);
  const doDia = agendamentos.filter((a) => a.data_agendamento === data && a.id_dep === departamento.id_dep);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <div className="no-print mb-8 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar à agenda
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Printer className="size-4" /> Imprimir
        </button>
      </div>

      <header className="border-b border-border pb-5">
        <h1 className="text-3xl">Sessões de massagem</h1>
        <p className="mt-1 capitalize text-muted-foreground">
          {formatarData(data)} · {nomeDiaSemana(data)}
        </p>
        <p className="mt-2 text-sm">
          Departamento: <strong className="font-medium">{departamento.nome_dep}</strong> · Massagista:{" "}
          <strong className="font-medium">{massagista.nome_massagista}</strong> ({massagista.telefone})
        </p>
      </header>

      <ol className="mt-6 divide-y divide-border">
        {horariosDoDia().map((horario, i) => {
          const ag = doDia.find((a) => a.horario === horario);
          const nome = ag
            ? (pessoas.find((p) => p.id_funcionario === ag.id_funcionario)?.nome ?? "—")
            : "—";
          return (
            <li key={horario} className="flex items-center gap-5 py-2.5 text-sm">
              <span className="w-7 tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <span className="w-16 font-medium tabular-nums">{horario}</span>
              <span className="flex-1">{nome}</span>
            </li>
          );
        })}
      </ol>

      <p className="mt-8 text-xs text-muted-foreground">
        Sessões de 20 minutos · 09h às 16h · intervalo das 12h às 13h
      </p>
    </main>
  );
}
