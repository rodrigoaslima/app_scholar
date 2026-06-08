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
  const [loadedStudent, setLoadedStudent] = useState<StudentRecord | null>(null);
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

  async function selectProfessorDiscipline(value: string) {
    setSelectedDisciplineId(value);
    setSelectedStudentId('');
    setDisciplineStudents([]);
    setLoadedStudent(null);
    setNota1('');
    setNota2('');
    setError('');
    setFeedback('');

    if (!token || !value) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.listDisciplineStudents(token, Number(value));
      setDisciplineStudents(response.alunos);
      setError('');
    } catch (studentsError) {
      setError(studentsError instanceof Error ? studentsError.message : 'Nao foi possivel carregar alunos.');
    } finally {
      setIsLoading(false);
    }
  }

  function selectProfessorStudent(value: string) {
    setSelectedStudentId(value);
    setLoadedStudent(null);
    setNota1('');
    setNota2('');
    setError('');
    setFeedback('');
  }

  function loadSelectedStudent() {
    if (!selectedDisciplineId) {
      setError('Selecione a disciplina.');
      return;
    }

    if (!selectedStudentId) {
      setError('Selecione o aluno.');
      return;
    }

    const student = disciplineStudents.find((item) => String(item.id) === selectedStudentId);

    if (!student) {
      setError('Aluno nao encontrado para esta disciplina.');
      return;
    }

    setLoadedStudent(student);
    setNota1(student.nota1 === null || student.nota1 === undefined ? '' : String(student.nota1));
    setNota2(student.nota2 === null || student.nota2 === undefined ? '' : String(student.nota2));
    setError('');
    setFeedback('');
  }

  async function saveGrade() {
    if (!token || !selectedDisciplineId || !loadedStudent || !nota1 || !nota2) {
      setError('Informe disciplina, aluno e as duas notas.');
      return;
    }

    try {
      await api.saveGrade(token, {
        aluno_id: Number(loadedStudent.id),
        disciplina_id: Number(selectedDisciplineId),
        nota1: Number(nota1),
        nota2: Number(nota2),
      });
      setFeedback('Notas salvas com sucesso.');
      const response = await api.listDisciplineStudents(token, Number(selectedDisciplineId));
      const updatedStudent = response.alunos.find((student) => student.id === loadedStudent.id);
      setDisciplineStudents(response.alunos);
      setLoadedStudent(updatedStudent || loadedStudent);
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
              <FormHelper>Selecione a disciplina e depois o aluno para lancar ou alterar notas.</FormHelper>
              <AppSelect
                label="Disciplina"
                onChange={selectProfessorDiscipline}
                options={professorDisciplines.map((discipline) => ({
                  label: `${discipline.nome}/${discipline.carga_horaria} horas semanais`,
                  value: String(discipline.id),
                }))}
                placeholder="Selecione a disciplina"
                value={selectedDisciplineId}
              />
              <AppSelect
                disabled={!selectedDisciplineId}
                label="Aluno"
                onChange={selectProfessorStudent}
                options={disciplineStudents.map((student) => ({
                  label: `${student.nome || student.name} - RA ${student.matricula || student.id}`,
                  value: String(student.id),
                }))}
                placeholder={
                  selectedDisciplineId
                    ? disciplineStudents.length
                      ? 'Selecione o aluno'
                      : 'Nenhum aluno nesta disciplina'
                    : 'Selecione a disciplina primeiro'
                }
                value={selectedStudentId}
              />
              <AppButton
                disabled={!selectedDisciplineId || !selectedStudentId}
                label="Carregar aluno"
                onPress={loadSelectedStudent}
                variant="secondary"
              />
            </FormSection>
          ) : null}

          {loadedStudent ? (
            <FormSection>
              <FormHelper>Professor pode adicionar ou alterar notas, mas nao pode apagar.</FormHelper>
              <DataTitle>{loadedStudent.nome || loadedStudent.name}</DataTitle>
              <DataMeta>RA: {loadedStudent.matricula || loadedStudent.id}</DataMeta>
              <DataMeta>
                Media: {loadedStudent.media ?? '-'} | Situacao: {loadedStudent.situacao || 'Pendente'}
              </DataMeta>
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
