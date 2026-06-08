import { useEffect, useMemo, useState } from 'react';

import { AppButton } from '../components/AppButton';
import { AppSelect } from '../components/AppSelect';
import { AppTextInput } from '../components/AppTextInput';
import { ScreenContainer } from '../components/ScreenContainer';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Course, Discipline, ReportEntry, StudentRecord } from '../types/models';
import {
  DisciplineName,
  ErrorBanner,
  LoadingCard,
  LoadingText,
  MetricCard,
  MetricGrid,
  MetricLabel,
  MetricValue,
  ReportCardSurface,
  ReportHeader,
  StatusBadge,
} from './ReportCardScreen.styles';
import {
  ActionRow,
  DataCard,
  DataMeta,
  DataTitle,
  FormHelper,
  FormSection,
  SuccessBanner,
} from './FormScreen.styles';

function normalizeStatus(status?: ReportEntry['status'] | null): ReportEntry['status'] {
  return status || 'Recuperacao';
}

export function ReportCardScreen() {
  const { token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [adminCourse, setAdminCourse] = useState('');
  const [adminRegistration, setAdminRegistration] = useState('');
  const [adminCourses, setAdminCourses] = useState<Course[]>([]);
  const [adminStudents, setAdminStudents] = useState<StudentRecord[]>([]);
  const [reportStudent, setReportStudent] = useState('');
  const [reportEntries, setReportEntries] = useState<Discipline[]>([]);

  const [professorDisciplines, setProfessorDisciplines] = useState<Discipline[]>([]);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState('');
  const [disciplineStudents, setDisciplineStudents] = useState<StudentRecord[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [nota1, setNota1] = useState('');
  const [nota2, setNota2] = useState('');
  const filteredAdminStudents = useMemo(
    () => adminStudents.filter((student) => (student.curso || student.course) === adminCourse),
    [adminCourse, adminStudents]
  );

  async function loadInitialData() {
    if (!token || !user) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      if (user.role === 'aluno') {
        const response = await api.listMyGrades(token);
        setReportStudent(response.aluno);
        setReportEntries(response.disciplinas);
      }

      if (user.role === 'professor') {
        const response = await api.listProfessorDisciplines(token);
        setProfessorDisciplines(response.disciplinas);
      }

      if (user.role === 'administrador') {
        const [coursesResponse, studentsResponse] = await Promise.all([
          api.listCourses(),
          api.listStudents(token),
        ]);
        setAdminCourses(coursesResponse.cursos);
        setAdminStudents(studentsResponse.alunos);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar dados.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, [token, user]);

  async function loadAdminReport() {
    if (!token || !adminRegistration.trim()) {
      setError('Selecione o aluno.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.getReport(token, adminRegistration.trim());
      setReportStudent(response.aluno);
      setReportEntries(response.disciplinas);
      setError('');
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : 'Nao foi possivel carregar boletim.');
    } finally {
      setIsLoading(false);
    }
  }

  function selectAdminCourse(value: string) {
    setAdminCourse(value);
    setAdminRegistration('');
    setReportStudent('');
    setReportEntries([]);
    setError('');
    setFeedback('');
  }

  function selectAdminStudent(value: string) {
    setAdminRegistration(value);
    setReportStudent('');
    setReportEntries([]);
    setError('');
    setFeedback('');
  }

  async function loadStudentsFromDiscipline() {
    if (!token || !selectedDisciplineId) {
      setError('Informe o ID da disciplina.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.listDisciplineStudents(token, Number(selectedDisciplineId));
      setDisciplineStudents(response.alunos);
      setError('');
    } catch (studentsError) {
      setError(studentsError instanceof Error ? studentsError.message : 'Nao foi possivel carregar alunos.');
    } finally {
      setIsLoading(false);
    }
  }

  async function saveGrade() {
    if (!token || !selectedDisciplineId || !selectedStudentId || !nota1 || !nota2) {
      setError('Informe disciplina, aluno e as duas notas.');
      return;
    }

    try {
      await api.saveGrade(token, {
        aluno_id: Number(selectedStudentId),
        disciplina_id: Number(selectedDisciplineId),
        nota1: Number(nota1),
        nota2: Number(nota2),
      });
      setFeedback('Notas salvas com sucesso.');
      await loadStudentsFromDiscipline();
    } catch (gradeError) {
      setError(gradeError instanceof Error ? gradeError.message : 'Nao foi possivel salvar notas.');
    }
  }

  function renderReport() {
    if (!reportEntries.length) {
      return (
        <LoadingCard>
          <LoadingText>Nenhuma materia vinculada, procurar a administracao</LoadingText>
        </LoadingCard>
      );
    }

    return reportEntries.map((entry) => {
      const disciplineName = entry.disciplina || entry.nome;
      const status = normalizeStatus(entry.situacao);

      return (
        <ReportCardSurface key={`${disciplineName}-${entry.id || status}`}>
          <ReportHeader>
            <DisciplineName>{disciplineName}</DisciplineName>
            <StatusBadge status={status}>{entry.situacao || 'Sem nota'}</StatusBadge>
          </ReportHeader>

          <MetricGrid>
            <MetricCard>
              <MetricLabel>Nota 1</MetricLabel>
              <MetricValue>{entry.nota1 ?? '-'}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Nota 2</MetricLabel>
              <MetricValue>{entry.nota2 ?? '-'}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Media</MetricLabel>
              <MetricValue>{entry.media ?? '-'}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Situacao</MetricLabel>
              <MetricValue>{entry.situacao || 'Pendente'}</MetricValue>
            </MetricCard>
          </MetricGrid>
        </ReportCardSurface>
      );
    });
  }

  return (
    <ScreenContainer
      subtitle="Acesso a materias e notas do aluno"
      title={user?.role === 'professor' ? 'Lancamento de Notas' : 'Boletim Academico'}
    >
      {isLoading ? (
        <LoadingCard>
          <LoadingText>Carregando dados...</LoadingText>
        </LoadingCard>
      ) : null}

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}
      {feedback ? <SuccessBanner>{feedback}</SuccessBanner> : null}

      {user?.role === 'administrador' ? (
        <FormSection>
          <FormHelper>Administrador pode consultar boletim pelo aluno.</FormHelper>
          <AppSelect
            label="Curso"
            onChange={selectAdminCourse}
            options={adminCourses.map((course) => ({ label: course.nome, value: course.nome }))}
            placeholder={adminCourses.length ? 'Selecione o curso' : 'Nenhum curso cadastrado'}
            value={adminCourse}
          />
          <AppSelect
            disabled={!adminCourse}
            label="Aluno"
            onChange={selectAdminStudent}
            options={filteredAdminStudents.map((student) => ({
              label: `${student.nome || student.name} - RA ${student.matricula || student.id}`,
              value: String(student.matricula || student.id),
            }))}
            placeholder={
              adminCourse
                ? filteredAdminStudents.length
                  ? 'Selecione o aluno'
                  : 'Nenhum aluno neste curso'
                : 'Selecione o curso primeiro'
            }
            value={adminRegistration}
          />
          <AppButton label="Consultar boletim" onPress={loadAdminReport} />
          {reportStudent ? <DataMeta>Aluno: {reportStudent}</DataMeta> : null}
        </FormSection>
      ) : null}

      {user?.role === 'professor' ? (
        <>
          {!professorDisciplines.length && !isLoading ? (
            <LoadingCard>
              <LoadingText>Nenhuma materia vinculada, procurar a administracao</LoadingText>
            </LoadingCard>
          ) : null}

          {professorDisciplines.length ? (
            <FormSection>
              <FormHelper>Informe o ID da disciplina vinculada para listar alunos e lancar notas.</FormHelper>
              {professorDisciplines.map((discipline) => (
                <DataMeta key={discipline.id}>
                  ID {discipline.id}: {discipline.nome} - {discipline.semestre}
                </DataMeta>
              ))}
              <AppTextInput keyboardType="numeric" label="ID da disciplina" onChangeText={setSelectedDisciplineId} value={selectedDisciplineId} />
              <AppButton label="Carregar alunos" onPress={loadStudentsFromDiscipline} variant="secondary" />
            </FormSection>
          ) : null}

          {disciplineStudents.map((student) => (
            <DataCard key={student.id}>
              <DataTitle>ID {student.id}: {student.nome || student.name}</DataTitle>
              <DataMeta>ID do aluno: {student.id}</DataMeta>
              <DataMeta>
                Nota 1: {student.nota1 ?? '-'} | Nota 2: {student.nota2 ?? '-'} | Media: {student.media ?? '-'} | Situacao: {student.situacao || 'Pendente'}
              </DataMeta>
            </DataCard>
          ))}

          {professorDisciplines.length ? (
            <FormSection>
              <FormHelper>Professor pode adicionar ou alterar notas, mas nao pode apagar.</FormHelper>
              <AppTextInput keyboardType="numeric" label="ID do aluno" onChangeText={setSelectedStudentId} value={selectedStudentId} />
              <AppTextInput keyboardType="numeric" label="Nota 1" onChangeText={setNota1} value={nota1} />
              <AppTextInput keyboardType="numeric" label="Nota 2" onChangeText={setNota2} value={nota2} />
              <ActionRow>
                <AppButton label="Salvar notas" onPress={saveGrade} />
              </ActionRow>
            </FormSection>
          ) : null}
        </>
      ) : null}

      {user?.role === 'aluno' || user?.role === 'administrador' ? renderReport() : null}
    </ScreenContainer>
  );
}
