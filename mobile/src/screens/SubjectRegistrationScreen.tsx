import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { ScreenContainer } from '../components/ScreenContainer';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Discipline, SubjectRecord } from '../types/models';
import {
  ActionRow,
  DataActionCard,
  DataMeta,
  DataTitle,
  ErrorBanner,
  FormHelper,
  FormSection,
  SuccessBanner,
} from './FormScreen.styles';

const initialForm: SubjectRecord = {
  name: '',
  workload: '',
};

export function SubjectRegistrationScreen() {
  const { token, user } = useAuth();
  const [editingDisciplineId, setEditingDisciplineId] = useState<number | null>(null);
  const [form, setForm] = useState<SubjectRecord>(initialForm);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function loadDisciplines() {
    if (!token) {
      return;
    }

    try {
      const response = await api.listDisciplines(token);
      setDisciplines(response.disciplinas);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar disciplinas.');
    }
  }

  useEffect(() => {
    loadDisciplines();
  }, [token]);

  function updateField(field: keyof SubjectRecord, value: string) {
    setFeedback('');
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setEditingDisciplineId(null);
    setForm(initialForm);
  }

  function selectDiscipline(discipline: Discipline) {
    setFeedback('');
    setError('');
    setEditingDisciplineId(discipline.id);
    setForm({
      name: discipline.nome,
      workload: String(discipline.carga_horaria),
    });
  }

  async function handleSubmit() {
    if (!token || user?.role !== 'administrador') {
      setError('Somente administrador pode cadastrar disciplina.');
      return;
    }

    if (!form.name.trim() || !form.workload.trim()) {
      setError('Nome da disciplina e horas semanais sao obrigatorios.');
      return;
    }

    try {
      setIsLoading(true);
      if (editingDisciplineId) {
        await api.updateDiscipline(token, editingDisciplineId, form);
        setFeedback('Disciplina atualizada com sucesso.');
      } else {
        await api.createDiscipline(token, form);
        setFeedback('Disciplina cadastrada com sucesso.');
      }
      resetForm();
      await loadDisciplines();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nao foi possivel cadastrar disciplina.');
    } finally {
      setIsLoading(false);
    }
  }

  async function removeDiscipline(discipline: Discipline) {
    if (!token) {
      return;
    }

    Alert.alert('Remover disciplina', 'Deseja remover esta disciplina?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteDiscipline(token, discipline.id);
            if (editingDisciplineId === discipline.id) {
              resetForm();
            }
            await loadDisciplines();
          } catch (removeError) {
            setError(removeError instanceof Error ? removeError.message : 'Nao foi possivel remover disciplina.');
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer
      subtitle="Cadastre disciplinas e defina as horas semanais."
      title="Cadastrar Disciplinas"
    >
      <FormSection>
        <FormHelper>Cadastre as disciplinas que depois poderao ser vinculadas aos cursos.</FormHelper>

        <AppTextInput
          label="Nome da disciplina"
          onChangeText={(value) => updateField('name', value)}
          value={form.name}
        />
        <AppTextInput
          keyboardType="numeric"
          label="Horas semanais"
          onChangeText={(value) => updateField('workload', value)}
          value={form.workload}
        />

        {feedback ? <SuccessBanner>{feedback}</SuccessBanner> : null}
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <AppButton
          disabled={isLoading}
          label={isLoading ? 'Salvando...' : editingDisciplineId ? 'Atualizar disciplina' : 'Salvar disciplina'}
          onPress={handleSubmit}
        />
        {editingDisciplineId ? (
          <ActionRow>
            <AppButton label="Cancelar edicao" onPress={resetForm} variant="secondary" />
            <AppButton
              label="Apagar disciplina"
              onPress={() => {
                const discipline = disciplines.find((item) => item.id === editingDisciplineId);
                if (discipline) {
                  removeDiscipline(discipline);
                }
              }}
              variant="ghost"
            />
          </ActionRow>
        ) : null}
      </FormSection>

      {disciplines.map((discipline) => (
        <DataActionCard key={discipline.id} onPress={() => selectDiscipline(discipline)}>
          <DataTitle>ID {discipline.id}: {discipline.nome}</DataTitle>
          <DataMeta>{discipline.carga_horaria} horas semanais</DataMeta>
          <DataMeta>Toque para editar</DataMeta>
        </DataActionCard>
      ))}
    </ScreenContainer>
  );
}
