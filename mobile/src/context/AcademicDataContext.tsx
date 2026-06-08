import { createContext, PropsWithChildren, useMemo, useState } from 'react';

import type {
  ProfessorRecord,
  StudentRecord,
  SubjectRecord,
} from '../types/models';

type AcademicDataContextValue = {
  students: StudentRecord[];
  professors: ProfessorRecord[];
  subjects: SubjectRecord[];
  addStudent: (student: StudentRecord) => void;
  addProfessor: (professor: ProfessorRecord) => void;
  addSubject: (subject: SubjectRecord) => void;
};

export const AcademicDataContext = createContext<
  AcademicDataContextValue | undefined
>(undefined);

export function AcademicDataProvider({ children }: PropsWithChildren) {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [professors, setProfessors] = useState<ProfessorRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);

  const value = useMemo<AcademicDataContextValue>(
    () => ({
      students,
      professors,
      subjects,
      addStudent: (student) => {
        console.log('Aluno cadastrado:', student);
        setStudents((current) => [student, ...current]);
      },
      addProfessor: (professor) => {
        console.log('Professor cadastrado:', professor);
        setProfessors((current) => [professor, ...current]);
      },
      addSubject: (subject) => {
        console.log('Disciplina cadastrada:', subject);
        setSubjects((current) => [subject, ...current]);
      },
    }),
    [professors, students, subjects]
  );

  return (
    <AcademicDataContext.Provider value={value}>
      {children}
    </AcademicDataContext.Provider>
  );
}
