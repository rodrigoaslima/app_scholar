import type { Course, Discipline } from '../types/models';

export function getDisciplinesForCourses(courses: Course[], selectedCourseIds: string[]) {
  const selectedCourses = new Set(selectedCourseIds.map(Number));
  const disciplineById = new Map<number, Pick<Discipline, 'id' | 'nome' | 'carga_horaria'>>();

  courses
    .filter((course) => selectedCourses.has(course.id))
    .forEach((course) => {
      course.disciplinas?.forEach((discipline) => {
        disciplineById.set(discipline.id, discipline);
      });
    });

  return Array.from(disciplineById.values()).sort((first, second) =>
    first.nome.localeCompare(second.nome)
  );
}

export function sumWeeklyHours(
  disciplines: Array<Pick<Discipline, 'id' | 'carga_horaria'>>,
  selectedDisciplineIds: string[]
) {
  const selectedDisciplines = new Set(selectedDisciplineIds.map(Number));

  return disciplines.reduce((total, discipline) => {
    if (!selectedDisciplines.has(discipline.id)) {
      return total;
    }

    return total + Number(discipline.carga_horaria || 0);
  }, 0);
}
