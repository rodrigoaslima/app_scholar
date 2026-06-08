import type { ReportEntry } from '../types/models';

const baseEntries = [
  { id: '1', discipline: 'Programacao Mobile', grade1: 8.5, grade2: 9.1 },
  { id: '2', discipline: 'Banco de Dados', grade1: 7.2, grade2: 6.8 },
  { id: '3', discipline: 'Engenharia de Software', grade1: 5.9, grade2: 5.4 },
  { id: '4', discipline: 'UX para Aplicativos', grade1: 9.0, grade2: 8.7 },
];

function getStatus(average: number): ReportEntry['status'] {
  if (average >= 7) {
    return 'Aprovado';
  }

  if (average >= 5) {
    return 'Recuperacao';
  }

  return 'Reprovado';
}

export async function getMockReportEntries(): Promise<ReportEntry[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        baseEntries.map((entry) => {
          const average = Number(((entry.grade1 + entry.grade2) / 2).toFixed(1));

          return {
            ...entry,
            average,
            status: getStatus(average),
          };
        })
      );
    }, 700);
  });
}
