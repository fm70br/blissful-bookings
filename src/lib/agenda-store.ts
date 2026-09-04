import { useSyncExternalStore } from "react";
import type { Agendamento } from "./massagem";
import { datasDisponiveis, horariosDoDia, isoDate } from "./massagem";

const KEY = "agenda-massagem:agendamentos";

function seed(): Agendamento[] {
  const datas = datasDisponiveis(new Date(), 14).slice(0, 3);
  const horarios = horariosDoDia();
  const pares: Array<[string, number, string]> = [
    [datas[0] ?? "", 1, "F3"],
    [datas[0] ?? "", 4, "F5"],
    [datas[0] ?? "", 9, "F8"],
    [datas[1] ?? "", 2, "F4"],
    [datas[1] ?? "", 6, "F10"],
    [datas[2] ?? "", 0, "F7"],
  ];
  return pares
    .filter(([data]) => data)
    .map(([data, idx, func], i) => ({
      id_agendamento: `A${i + 1}`,
      id_dep: "D1",
      data_agendamento: data,
      horario: horarios[idx]!,
      id_funcionario: func,
    }));
}

let agendamentos: Agendamento[] = [];
let carregado = false;
const listeners = new Set<() => void>();

function load() {
  if (carregado) return;
  carregado = true;
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(KEY);
  agendamentos = raw ? (JSON.parse(raw) as Agendamento[]) : seed();
  persist();
}

function persist() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(agendamentos));
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
}

const VAZIO: Agendamento[] = [];

export function useAgendamentos() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return agendamentos;
    },
    () => VAZIO,
  );
}

export function getAgendamentos() {
  load();
  return agendamentos;
}

export function criarAgendamento(a: Omit<Agendamento, "id_agendamento">) {
  load();
  const ocupado = agendamentos.some(
    (x) => x.id_dep === a.id_dep && x.data_agendamento === a.data_agendamento && x.horario === a.horario,
  );
  if (ocupado) return false;
  agendamentos = [...agendamentos, { ...a, id_agendamento: `A${Date.now()}` }];
  persist();
  return true;
}

export function cancelarAgendamento(id: string) {
  load();
  agendamentos = agendamentos.filter((a) => a.id_agendamento !== id);
  persist();
}

export const hojeIso = () => isoDate(new Date());
