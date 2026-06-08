import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppMultiSelect } from '../components/AppMultiSelect';
import { AppTextInput } from '../components/AppTextInput';
import { ScreenContainer } from '../components/ScreenContainer';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Course, Discipline } from '../types/models';
import {
  ActionRow,
  DataActionCard,
  DataMeta,
  DataTitle,
  ErrorBanner,
  FormSection,
  SuccessBanner,
} from './FormScreen.styles';

export function CourseRegistrationScreen() {
  const { token, user } = useAuth();
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseName, setCourseName] = useState('');
  const [selectedDisciplineIds, setSelectedDisciplineIds] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function loadData() {
    if (!token) {
      return;
    }

    try {
      const [coursesResponse, disciplinesResponse] = await Promise.all([
        api.listCourses(),
        api.listDisciplines(token),
      ]);
      setCourses(coursesResponse.cursos);
      setDisciplines(disciplinesResponse.disciplinas);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar cursos e disciplinas.');
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  function updateCourseName(value: string) {
    setFeedback('');
    setError('');
    setCourseName(value);
  }

  function updateDisciplines(values: string[]) {
    setFeedback('');
    setError('');
    setSelectedDisciplineIds([...new Set(values)]);
  }

  function resetForm() {
    setEditingCourseId(null);
    setCourseName('');
    setSelectedDisciplineIds([]);
  }

  function selectCourse(course: Course) {
    setFeedback('');
    setError('');
    setEditingCourseId(course.id);
    setCourseName(course.nome);
    setSelectedDisciplineIds(course.disciplinas?.map((discipline) => String(discipline.id)) || []);
  }

  async function handleSubmit() {
    if (!token || user?.role !== 'administrador') {
      setError('Somente administrador pode cadastrar cursos.');
      return;
    }

    if (!courseName.trim()) {
      setError('Nome do curso e obrigatorio.');
      return;
    }

    if (!selectedDisciplineIds.length) {
      setError('Selecione ao menos uma disciplina.');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        nome: courseName.trim(),
        disciplina_ids: selectedDisciplineIds.map(Number),
      };

      if (editingCourseId) {
        await api.updateCourse(token, editingCourseId, payload);
        setFeedback('Curso atualizado com sucesso.');
      } else {
        await api.createCourse(token, payload);
        setFeedback('Curso cadastrado com sucesso.');
      }

      resetForm();
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nao foi possivel cadastrar curso.');
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteSelectedCourse() {
    if (!token || !editingCourseId) {
      return;
    }

    Alert.alert('Apagar curso', 'Deseja apagar este curso?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoading(true);
            await api.deleteCourse(token, editingCourseId);
            setFeedback('Curso removido com sucesso.');
            resetForm();
            await loadData();
          } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'Nao foi possivel apagar curso.');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer
      subtitle="Cadastre Cursos e vincule disciplinas"
      title="Cadastrar Cursos"
    >
      <FormSection>
        <AppTextInput
          label="Nome do curso"
          onChangeText={updateCourseName}
          placeholder="Analise de Sistemas"
          value={courseName}
        />
        <AppMultiSelect
          label="Disciplinas"
          onChange={updateDisciplines}
          options={disciplines.map((discipline) => ({
            label: discipline.nome,
            value: String(discipline.id),
          }))}
          placeholder={disciplines.length ? 'Selecione as disciplinas' : 'Cadastre disciplinas primeiro'}
          values={selectedDisciplineIds}
        />

        {feedback ? <SuccessBanner>{feedback}</SuccessBanner> : null}
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <AppButton
          disabled={isLoading}
          label={isLoading ? 'Salvando...' : editingCourseId ? 'Atualizar curso' : 'Salvar curso'}
          onPress={handleSubmit}
        />
        {editingCourseId ? (
          <ActionRow>
            <AppButton label="Cancelar edicao" onPress={resetForm} variant="secondary" />
            <AppButton label="Apagar curso" onPress={deleteSelectedCourse} variant="ghost" />
          </ActionRow>
        ) : null}
      </FormSection>

      {courses.map((course) => (
        <DataActionCard key={course.id} onPress={() => selectCourse(course)}>
          <DataTitle>ID {course.id}: {course.nome}</DataTitle>
          <DataMeta>
            Disciplinas: {course.disciplinas?.length
              ? course.disciplinas.map((discipline) => discipline.nome).join(', ')
              : 'Nenhuma disciplina vinculada'}
          </DataMeta>
          <DataMeta>Toque para editar</DataMeta>
        </DataActionCard>
      ))}
    </ScreenContainer>
  );
}
