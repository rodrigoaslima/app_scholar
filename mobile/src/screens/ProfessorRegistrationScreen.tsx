import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppMultiSelect } from '../components/AppMultiSelect';
import { AppTextInput } from '../components/AppTextInput';
import { ScreenContainer } from '../components/ScreenContainer';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Course, ProfessorRecord } from '../types/models';
import { getDisciplinesForCourses, sumWeeklyHours } from '../utils/professorWorkload';
import {
  ActionRow,
  DataActionCard,
  DataMeta,
  DataTitle,
  ErrorBanner,
  FormSection,
  SuccessBanner,
} from './FormScreen.styles';

const initialForm: ProfessorRecord = {
  name: '',
  degree: '',
  email: '',
  curso_ids: [],
  disciplina_ids: [],
};

export function ProfessorRegistrationScreen() {
  const { token, user } = useAuth();
  const [editingProfessorId, setEditingProfessorId] = useState<number | null>(null);
  const [form, setForm] = useState<ProfessorRecord>(initialForm);
  const [courses, setCourses] = useState<Course[]>([]);
  const [professors, setProfessors] = useState<ProfessorRecord[]>([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedCourseIds = (form.curso_ids || []).map(String);
  const selectedDisciplineIds = (form.disciplina_ids || []).map(String);
  const availableDisciplines = useMemo(
    () => getDisciplinesForCourses(courses, selectedCourseIds),
    [courses, selectedCourseIds.join(',')]
  );
  const weeklyHours = sumWeeklyHours(availableDisciplines, selectedDisciplineIds);

  async function loadData() {
    if (!token) {
      return;
    }

    try {
      const [professorsResponse, coursesResponse] = await Promise.all([
        api.listProfessors(token),
        api.listCourses(),
      ]);
      setProfessors(professorsResponse.professores);
      setCourses(coursesResponse.cursos);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar professores.');
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  useEffect(() => {
    const availableIds = new Set(availableDisciplines.map((discipline) => discipline.id));
    const filteredIds = (form.disciplina_ids || []).filter((disciplineId) => availableIds.has(disciplineId));

    if (filteredIds.length !== (form.disciplina_ids || []).length) {
      setForm((current) => ({ ...current, disciplina_ids: filteredIds }));
    }
  }, [availableDisciplines, form.disciplina_ids]);

  function updateField(field: 'name' | 'email' | 'degree', value: string) {
    setFeedback('');
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateCourses(values: string[]) {
    setFeedback('');
    setError('');
    setForm((current) => ({
      ...current,
      curso_ids: [...new Set(values.map(Number).filter(Boolean))],
      disciplina_ids: [],
    }));
  }

  function updateDisciplines(values: string[]) {
    setFeedback('');
    setError('');

    const nextValues = [...new Set(values)];
    const nextWeeklyHours = sumWeeklyHours(availableDisciplines, nextValues);

    if (nextWeeklyHours > 40) {
      setError('A carga horaria semanal nao pode passar de 40 horas.');
      return;
    }

    setForm((current) => ({
      ...current,
      disciplina_ids: nextValues.map(Number).filter(Boolean),
    }));
  }

  function resetForm() {
    setEditingProfessorId(null);
    setForm(initialForm);
  }

  function selectProfessor(professor: ProfessorRecord) {
    setFeedback('');
    setError('');
    setEditingProfessorId(professor.id || null);
    setForm({
      name: professor.nome || professor.name || '',
      email: professor.email || '',
      degree: professor.titulacao || professor.degree || '',
      curso_ids: professor.curso_ids || professor.cursos?.map((course) => course.id) || [],
      disciplina_ids:
        professor.disciplina_ids || professor.disciplinas?.map((discipline) => discipline.id) || [],
    });
  }

  async function handleSubmit() {
    if (!token || user?.role !== 'administrador') {
      setError('Somente administrador pode gerenciar professores.');
      return;
    }

    if (!form.name.trim() || !form.email.trim() || !form.degree.trim()) {
      setError('Nome, email e titulação são obrigatórios.');
      return;
    }

    if (!form.curso_ids?.length) {
      setError('Selecione ao menos um curso.');
      return;
    }

    if (!form.disciplina_ids?.length) {
      setError('Selecione ao menos uma disciplina.');
      return;
    }

    if (weeklyHours > 40) {
      setError('A carga horaria semanal nao pode passar de 40 horas.');
      return;
    }

    try {
      setIsLoading(true);

      if (editingProfessorId) {
        await api.updateProfessor(token, editingProfessorId, form);
        setFeedback('Professor atualizado com sucesso.');
      } else {
        await api.createProfessor(token, form);
        setFeedback('Professor cadastrado com sucesso.');
      }

      resetForm();
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nao foi possivel salvar professor.');
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleAccess() {
    if (!token || !editingProfessorId) {
      return;
    }

    const professor = professors.find((item) => item.id === editingProfessorId);

    if (!professor?.usuario_id) {
      return;
    }

    try {
      await api.setUserActive(token, professor.usuario_id, !professor.ativo);
      await loadData();
    } catch (accessError) {
      setError(accessError instanceof Error ? accessError.message : 'Nao foi possivel alterar acesso.');
    }
  }

  async function deleteSelectedProfessor() {
    if (!token || !editingProfessorId) {
      return;
    }

    Alert.alert('Remover professor', 'Deseja remover este professor?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoading(true);
            await api.deleteProfessor(token, editingProfessorId);
            setFeedback('Professor removido com sucesso.');
            resetForm();
            await loadData();
          } catch (removeError) {
            setError(removeError instanceof Error ? removeError.message : 'Nao foi possivel remover professor.');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  }

  const editingProfessor = professors.find((professor) => professor.id === editingProfessorId);

  return (
    <ScreenContainer
      subtitle="Cadastre e gerencie professores"
      title="Gerenciar Professores"
    >
      <FormSection>
        <AppTextInput label="Nome" onChangeText={(value) => updateField('name', value)} value={form.name} />
        <AppTextInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={(value) => updateField('email', value)}
          value={form.email}
        />
        <AppTextInput label="Titulação" onChangeText={(value) => updateField('degree', value)} value={form.degree} />
        <AppMultiSelect
          label="Cursos"
          onChange={updateCourses}
          options={courses.map((course) => ({ label: course.nome, value: String(course.id) }))}
          placeholder={courses.length ? 'Selecione os cursos' : 'Cadastre cursos primeiro'}
          values={selectedCourseIds}
        />
        <AppMultiSelect
          disabled={!selectedCourseIds.length}
          label={`Disciplinas (${weeklyHours}/40h)`}
          onChange={updateDisciplines}
          options={availableDisciplines.map((discipline) => ({
            label: `${discipline.nome}/${discipline.carga_horaria} horas semanais`,
            value: String(discipline.id),
          }))}
          placeholder={selectedCourseIds.length ? 'Selecione as disciplinas' : 'Escolha cursos primeiro'}
          values={selectedDisciplineIds}
        />

        {feedback ? <SuccessBanner>{feedback}</SuccessBanner> : null}
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <AppButton
          disabled={isLoading}
          label={isLoading ? 'Salvando...' : editingProfessorId ? 'Atualizar professor' : 'Salvar professor'}
          onPress={handleSubmit}
        />
        {editingProfessorId ? (
          <ActionRow>
            <AppButton label="Cancelar edicao" onPress={resetForm} variant="secondary" />
            <AppButton
              label={editingProfessor?.ativo ? 'Bloquear acesso' : 'Desbloquear acesso'}
              onPress={toggleAccess}
              variant="secondary"
            />
            <AppButton label="Remover professor" onPress={deleteSelectedProfessor} variant="ghost" />
          </ActionRow>
        ) : null}
      </FormSection>

      {professors.map((professor) => (
        <DataActionCard key={professor.id} onPress={() => selectProfessor(professor)}>
          <DataTitle>{professor.nome || professor.name}</DataTitle>
          <DataMeta>Email: {professor.email}</DataMeta>
          <DataMeta>Titulação: {professor.titulacao || professor.degree || 'Nao informada'}</DataMeta>
          <DataMeta>
            Cursos: {professor.cursos?.length
              ? professor.cursos.map((course) => course.nome).join(', ')
              : 'Nenhum curso vinculado'}
          </DataMeta>
          <DataMeta>
            Disciplinas: {professor.disciplinas?.length
              ? professor.disciplinas
                  .map((discipline) => `${discipline.nome}/${discipline.carga_horaria}h`)
                  .join(', ')
              : 'Nenhuma disciplina vinculada'}
          </DataMeta>
          <DataMeta>Status: {professor.ativo ? 'Ativo' : 'Bloqueado'} | Toque para editar</DataMeta>
        </DataActionCard>
      ))}
    </ScreenContainer>
  );
}
