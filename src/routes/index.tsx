import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, Clock, Lock, Phone, Printer, User, X } from "lucide-react";
import {
  FUNCIONARIO_LOGADO_ID,
  agendamentosDaSemana,
  agendamentosDoMes,
  datasDisponiveis,
  departamentoDoFuncionario,
  formatarData,
  funcionariosDoDepartamento,
  getFuncionario,
  horariosDoDia,
  limiteMensalPorFuncionario,
  massagistaDoDepartamento,
  nomeDiaSemana,
  podeAgendar,
  isSexta,
} from "@/lib/massagem";
import { cancelarAgendamento, criarAgendamento, useAgendamentos } from "@/lib/agenda-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agenda de Massagem | Qualidade de Vida no Trabalho" },
      {
        name: "description",
        content:
          "Agende sua sessão de massagem de 20 minutos com a massagista do seu departamento, às segundas, quartas e sextas.",
      },
      { property: "og:title", content: "Agenda de Massagem | Qualidade de Vida no Trabalho" },
      {
        property: "og:description",
        content: "Escolha uma data disponível e reserve seu horário de massagem em poucos cliques.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const agendamentos = useAgendamentos();
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);

  const funcionario = getFuncionario(FUNCIONARIO_LOGADO_ID);
  const departamento = departamentoDoFuncionario(funcionario);
  const massagista = massagistaDoDepartamento(departamento);
  const datas = useMemo(() => datasDisponiveis(new Date()), []);

  const anoMes = (datas[0] ?? new Date().toISOString().slice(0, 10)).slice(0, 7);
  const { sessoesMes, qtdFuncionarios, limite } = limiteMensalPorFuncionario(anoMes, departamento.id_dep);
  const noMes = agendamentosDoMes(agendamentos, funcionario.id_funcionario, `${anoMes}-01`).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 md:py-16">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Qualidade de vida no trabalho
        </p>
        <h1 className="mt-2 text-4xl md:text-5xl">Agenda de Massagem</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Funcionário" value={funcionario.nome} icon={<User className="size-4" />}>
          {funcionario.id_dep_temporario ? "Alocação temporária" : "Alocação fixa"}
        </InfoCard>
        <InfoCard label="Departamento" value={departamento.nome_dep} icon={<CalendarDays className="size-4" />}>
          {qtdFuncionarios} funcionários
        </InfoCard>
        <InfoCard label="Massagista" value={massagista.nome_massagista} icon={<Phone className="size-4" />}>
          {massagista.telefone}
        </InfoCard>
      </section>

      <section className="mt-4 rounded-xl border border-border bg-secondary/60 px-5 py-4 text-sm text-secondary-foreground">
        <strong className="font-medium">Limite mensal:</strong> {sessoesMes} sessões no mês ÷ {qtdFuncionarios}{" "}
        funcionários = <strong className="font-medium">{limite} sessões por funcionário</strong>. Você já
        utilizou {noMes} neste mês. Máximo de 2 sessões por semana.
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Datas disponíveis</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Segundas, quartas e sextas, das 09h às 16h (intervalo 12h–13h). Sessões de 20 minutos.
        </p>

        <ol className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
          {datas.map((iso, i) => {
            const ocupadas = agendamentos.filter(
              (a) => a.data_agendamento === iso && a.id_dep === departamento.id_dep,
            ).length;
            const bloqueio = podeAgendar(agendamentos, funcionario, departamento.id_dep, iso);
            return (
              <li key={iso}>
                <button
                  onClick={() => setDataSelecionada(iso)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/60"
                >
                  <span className="w-8 shrink-0 text-sm tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium">{formatarData(iso)}</span>
                    <span className="block text-xs capitalize text-muted-foreground">{nomeDiaSemana(iso)}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {horariosDoDia().length - ocupadas} horários livres
                  </span>
                  {!bloqueio.podeAgendar && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                      <Lock className="size-3" /> bloqueado
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {dataSelecionada && (
        <FormularioSessoes
          data={dataSelecionada}
          onClose={() => setDataSelecionada(null)}
          id_dep={departamento.id_dep}
        />
      )}
    </main>
  );
}

function InfoCard({
  label,
  value,
  icon,
  children,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 font-display text-xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function FormularioSessoes({
  data,
  id_dep,
  onClose,
}: {
  data: string;
  id_dep: string;
  onClose: () => void;
}) {
  const agendamentos = useAgendamentos();
  const funcionario = getFuncionario(FUNCIONARIO_LOGADO_ID);
  const [erro, setErro] = useState<string | null>(null);

  const doDia = agendamentos.filter((a) => a.data_agendamento === data && a.id_dep === id_dep);
  const pessoas = funcionariosDoDepartamento(id_dep);
  const bloqueio = podeAgendar(agendamentos, funcionario, id_dep, data);
  const naSemana = agendamentosDaSemana(agendamentos, funcionario.id_funcionario, data).length;

  function reservar(horario: string) {
    if (!bloqueio.podeAgendar) {
      setErro(bloqueio.motivo ?? "Agendamento não permitido.");
      return;
    }
    criarAgendamento({ id_dep, data_agendamento: data, horario, id_funcionario: funcionario.id_funcionario });
    setErro(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm md:items-center md:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-[var(--shadow-lift)] md:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl">{formatarData(data)}</h2>
            <p className="text-sm capitalize text-muted-foreground">
              {nomeDiaSemana(data)} · {naSemana}/2 sessões usadas nesta semana
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/impressao/$data"
              params={{ data }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary"
            >
              <Printer className="size-3.5" /> Lista do dia
            </Link>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="rounded-full border border-border p-2 transition-colors hover:bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {(erro || !bloqueio.podeAgendar) && (
          <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {erro ?? bloqueio.motivo}
            {isSexta(data) && naSemana >= 2 ? "" : ""}
          </p>
        )}

        <ol className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {horariosDoDia().map((horario, i) => {
            const ocupado = doDia.find((a) => a.horario === horario);
            const nome = ocupado
              ? (pessoas.find((p) => p.id_funcionario === ocupado.id_funcionario)?.nome ?? "Reservado")
              : null;
            const meu = ocupado?.id_funcionario === funcionario.id_funcionario;

            return (
              <li
                key={horario}
                className={`flex items-center gap-4 px-4 py-3 text-sm ${
                  ocupado ? "bg-muted/60 text-muted-foreground" : "bg-card"
                }`}
              >
                <span className="w-7 shrink-0 tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex w-20 items-center gap-1.5 font-medium tabular-nums text-foreground">
                  <Clock className="size-3.5 text-muted-foreground" />
                  {horario}
                </span>
                <span className="flex-1 truncate">{nome ?? "Disponível"}</span>
                {ocupado ? (
                  meu ? (
                    <button
                      onClick={() => cancelarAgendamento(ocupado.id_agendamento)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      Cancelar
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Lock className="size-3" /> ocupado
                    </span>
                  )
                ) : (
                  <button
                    disabled={!bloqueio.podeAgendar}
                    onClick={() => reservar(horario)}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Agendar
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
