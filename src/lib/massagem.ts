// Domínio da Agenda de Massagem.
// Regras: segundas, quartas e sextas, 09h-16h, intervalo 12h-13h,
// sessões de 20 minutos, sem massagem em feriados.

export type Departamento = {
  id_dep: string;
  nome_dep: string;
  id_massagista: string;
};

export type Massagista = {
  id_massagista: string;
  nome_massagista: string;
  telefone: string;
  id_dep: string;
};

export type Funcionario = {
  id_funcionario: string;
  nome: string;
  id_dep: string;
  /** Departamento em que atua temporariamente (opcional). */
  id_dep_temporario?: string;
};

export type Agendamento = {
  id_agendamento: string;
  id_dep: string;
  data_agendamento: string; // YYYY-MM-DD
  horario: string; // HH:MM
  id_funcionario: string;
};

/* ------------------------------------------------------------------ */
/* Dados fornecidos pela plataforma (mock enquanto o backend não sobe) */
/* ------------------------------------------------------------------ */

export const massagistas: Massagista[] = [
  { id_massagista: "M1", nome_massagista: "Cláudia Ferraz", telefone: "(11) 98812-4410", id_dep: "D1" },
  { id_massagista: "M2", nome_massagista: "Rogério Lima", telefone: "(11) 99745-2018", id_dep: "D2" },
  { id_massagista: "M3", nome_massagista: "Simone Tavares", telefone: "(11) 99120-7733", id_dep: "D3" },
];

export const departamentos: Departamento[] = [
  { id_dep: "D1", nome_dep: "Tecnologia", id_massagista: "M1" },
  { id_dep: "D2", nome_dep: "Financeiro", id_massagista: "M2" },
  { id_dep: "D3", nome_dep: "Operações", id_massagista: "M3" },
];

const nomesTec = [
  "Fabio Minami",
  "Ana Beatriz Rocha",
  "Carlos Eduardo Prado",
  "Daniela Nunes",
  "Eduardo Sampaio",
  "Fernanda Klein",
  "Gustavo Arantes",
  "Helena Duarte",
  "Igor Bastos",
  "Juliana Mendes",
  "Lucas Ferreira",
  "Marina Salles",
];

export const funcionarios: Funcionario[] = [
  ...nomesTec.map((nome, i) => ({
    id_funcionario: `F${i + 1}`,
    nome,
    id_dep: "D1",
  })),
  { id_funcionario: "F20", nome: "Paulo Vasques", id_dep: "D2" },
  { id_funcionario: "F21", nome: "Renata Alcântara", id_dep: "D2", id_dep_temporario: "D1" },
  { id_funcionario: "F30", nome: "Tiago Moraes", id_dep: "D3" },
];

/** Funcionário autenticado na intranet — injetado pela plataforma. */
export const FUNCIONARIO_LOGADO_ID = "F1";

export function getFuncionario(id: string) {
  return funcionarios.find((f) => f.id_funcionario === id)!;
}

/** Departamento efetivo (considera alocação temporária). */
export function departamentoDoFuncionario(f: Funcionario) {
  const id = f.id_dep_temporario ?? f.id_dep;
  return departamentos.find((d) => d.id_dep === id)!;
}

export function massagistaDoDepartamento(dep: Departamento) {
  return massagistas.find((m) => m.id_massagista === dep.id_massagista)!;
}

export function funcionariosDoDepartamento(id_dep: string) {
  return funcionarios.filter((f) => (f.id_dep_temporario ?? f.id_dep) === id_dep);
}

/* ------------------------------------------------------------------ */
/* Calendário                                                          */
/* ------------------------------------------------------------------ */

/** Feriados nacionais (YYYY-MM-DD). */
export const feriados = new Set([
  "2026-09-07",
  "2026-10-12",
  "2026-11-02",
  "2026-11-15",
  "2026-11-20",
  "2026-12-25",
  "2027-01-01",
]);

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

export function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

/** "03 de setembro de 2026" */
export function formatarData(iso: string) {
  const d = parseIso(iso);
  return `${String(d.getDate()).padStart(2, "0")} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function nomeDiaSemana(iso: string) {
  return DIAS[parseIso(iso).getDay()]!;
}

export function isDiaDeMassagem(iso: string) {
  const dia = parseIso(iso).getDay();
  return [1, 3, 5].includes(dia) && !feriados.has(iso);
}

export function isSexta(iso: string) {
  return parseIso(iso).getDay() === 5;
}

/** Próximas datas disponíveis para agendamento. */
export function datasDisponiveis(a_partir_de: Date, dias = 45) {
  const lista: string[] = [];
  for (let i = 0; i < dias; i++) {
    const d = new Date(a_partir_de);
    d.setDate(d.getDate() + i);
    const iso = isoDate(d);
    if (isDiaDeMassagem(iso)) lista.push(iso);
  }
  return lista;
}

/** Horários de 20 min entre 09h e 16h, sem o intervalo de 12h-13h. */
export function horariosDoDia() {
  const slots: string[] = [];
  for (let minutos = 9 * 60; minutos < 16 * 60; minutos += 20) {
    const h = Math.floor(minutos / 60);
    if (h === 12) continue; // intervalo de almoço
    slots.push(`${String(h).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`);
  }
  return slots;
}

export const SESSOES_POR_DIA = horariosDoDia().length;

/** Segunda-feira da semana da data. */
export function inicioDaSemana(iso: string) {
  const d = parseIso(iso);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return isoDate(d);
}

export function mesmaSemana(a: string, b: string) {
  return inicioDaSemana(a) === inicioDaSemana(b);
}

export function mesmoMes(a: string, b: string) {
  return a.slice(0, 7) === b.slice(0, 7);
}

/* ------------------------------------------------------------------ */
/* Regras calculadas (nada disso é armazenado)                         */
/* ------------------------------------------------------------------ */

export const LIMITE_SEMANAL = 2;

/** Dias de massagem de um mês (YYYY-MM). */
export function diasDeMassagemNoMes(anoMes: string) {
  const [ano, mes] = anoMes.split("-").map(Number);
  const dias: string[] = [];
  const total = new Date(ano!, mes!, 0).getDate();
  for (let dia = 1; dia <= total; dia++) {
    const iso = `${anoMes}-${String(dia).padStart(2, "0")}`;
    if (isDiaDeMassagem(iso)) dias.push(iso);
  }
  return dias;
}

/**
 * Limite mensal de sessões por funcionário:
 * total de sessões do mês dividido pela quantidade de funcionários do departamento.
 */
export function limiteMensalPorFuncionario(anoMes: string, id_dep: string) {
  const sessoesMes = diasDeMassagemNoMes(anoMes).length * SESSOES_POR_DIA;
  const qtdFuncionarios = Math.max(1, funcionariosDoDepartamento(id_dep).length);
  return {
    sessoesMes,
    qtdFuncionarios,
    limite: Math.floor(sessoesMes / qtdFuncionarios),
  };
}

export function agendamentosDaSemana(ags: Agendamento[], id_funcionario: string, iso: string) {
  return ags.filter((a) => a.id_funcionario === id_funcionario && mesmaSemana(a.data_agendamento, iso));
}

export function agendamentosDoMes(ags: Agendamento[], id_funcionario: string, iso: string) {
  return ags.filter((a) => a.id_funcionario === id_funcionario && mesmoMes(a.data_agendamento, iso));
}

export type Bloqueio = { podeAgendar: boolean; motivo?: string };

export function podeAgendar(
  ags: Agendamento[],
  funcionario: Funcionario,
  id_dep: string,
  iso: string,
): Bloqueio {
  if (!isDiaDeMassagem(iso)) return { podeAgendar: false, motivo: "Não há massagem nesta data." };

  const naSemana = agendamentosDaSemana(ags, funcionario.id_funcionario, iso).length;
  if (naSemana >= LIMITE_SEMANAL) {
    return {
      podeAgendar: false,
      motivo: isSexta(iso)
        ? "Você já usufruiu de duas sessões nesta semana — sextas-feiras ficam bloqueadas."
        : "Limite de duas sessões por semana já atingido.",
    };
  }

  const { limite } = limiteMensalPorFuncionario(iso.slice(0, 7), id_dep);
  const noMes = agendamentosDoMes(ags, funcionario.id_funcionario, iso).length;
  if (noMes >= limite) {
    return { podeAgendar: false, motivo: `Limite mensal de ${limite} sessões atingido.` };
  }

  return { podeAgendar: true };
}
