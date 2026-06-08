import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppMultiSelect } from '../components/AppMultiSelect';
import { AppSelect } from '../components/AppSelect';
import { AppTextInput } from '../components/AppTextInput';
import { ScreenContainer } from '../components/ScreenContainer';
import { api, fetchAddressByCep } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Course, UserRole } from '../types/models';
import { formatPhone } from '../utils/formatters';
import { getDisciplinesForCourses, sumWeeklyHours } from '../utils/professorWorkload';
import {
  ActionRow,
  ErrorBanner,
  FormHelper,
  FormSection,
  OptionButton,
  OptionText,
  SuccessBanner,
} from './FormScreen.styles';

type Props = {
  onDone: () => void;
};

const roleLabels: Record<UserRole, string> = {
  administrador: 'Administrador',
  professor: 'Professor',
  aluno: 'Aluno',
};

export function RegisterScreen({ onDone }: Props) {
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>('aluno');
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    curso: '',
    telefone: '',
    cep: '',
    endereco: '',
    cidade: '',
    estado: '',
    titulacao: '',
    curso_ids: [] as number[],
    disciplina_ids: [] as number[],
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedProfessorCourseIds = form.curso_ids.map(String);
  const selectedProfessorDisciplineIds = form.disciplina_ids.map(String);
  const availableProfessorDisciplines = useMemo(
    () => getDisciplinesForCourses(courses, selectedProfessorCourseIds),
    [courses, selectedProfessorCourseIds.join(',')]
  );
  const professorWeeklyHours = sumWeeklyHours(
    availableProfessorDisciplines,
    selectedProfessorDisciplineIds
  );

  useEffect(() => {
    api.listCourses()
      .then((response) => setCourses(response.cursos))
      .catch(() => setError('Nao foi possivel carregar cursos.'));
  }, []);

  function updateField(field: keyof typeof form, value: string) {
    setFeedback('');
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updatePhone(value: string) {
    updateField('telefone', formatPhone(value));
  }

  function updateProfessorCourses(values: string[]) {
    setFeedback('');
    setError('');
    setForm((current) => ({
      ...current,
      curso_ids: [...new Set(values.map(Number).filter(Boolean))],
      disciplina_ids: [],
    }));
  }

  function updateProfessorDisciplines(values: string[]) {
    setFeedback('');
    setError('');

    const nextValues = [...new Set(values)];
    const nextWeeklyHours = sumWeeklyHours(availableProfessorDisciplines, nextValues);

    if (nextWeeklyHours > 40) {
      setError('A carga horaria semanal nao pode passar de 40 horas.');
      return;
    }

    setForm((current) => ({
      ...current,
      disciplina_ids: nextValues.map(Number).filter(Boolean),
    }));
  }

  async function fillAddress() {
    try {
      const address = await fetchAddressByCep(form.cep);
      setForm((current) => ({
        ...current,
        endereco: address.logradouro,
        cidade: address.localidade,
        estado: address.uf,
      }));
      setFeedback('Endereco preenchido pela ViaCEP.');
    } catch {
      Alert.alert('Erro', 'CEP não encontrado');
      setError('CEP nao encontrado.');
    }
  }

  async function handleSubmit() {
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      setError('Nome, email e senha sao obrigatorios.');
      return;
    }

    if (role === 'aluno' && !form.curso.trim()) {
      setError('Curso e obrigatorio para aluno.');
      return;
    }

    if (role === 'professor') {
      if (!form.titulacao.trim()) {
        setError('Titulação é obrigatória para professor.');
        return;
      }

      if (!form.curso_ids.length) {
        setError('Selecione ao menos um curso.');
        return;
      }

      if (!form.disciplina_ids.length) {
        setError('Selecione ao menos uma disciplina.');
        return;
      }

      if (professorWeeklyHours > 40) {
        setError('A carga horaria semanal nao pode passar de 40 horas.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await register({
        ...form,
        role,
      });
      setFeedback('Cadastro criado com sucesso.');
      Alert.alert('Cadastro criado', 'Conta criada com sucesso.');
      onDone();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nao foi possivel cadastrar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer
      includeTopInset
      subtitle="Crie o primeiro acesso ou cadastre uma nova conta com perfil definido."
      title="Cadastro de Usuario"
    >
      <FormSection>
        <FormHelper>Escolha a role da conta. Essa tela fica aberta para permitir o primeiro cadastro.</FormHelper>

        <ActionRow>
          {(['aluno', 'professor', 'administrador'] as UserRole[]).map((item) => (
            <OptionButton key={item} $active={role === item} onPress={() => setRole(item)}>
              <OptionText $active={role === item}>{roleLabels[item]}</OptionText>
            </OptionButton>
          ))}
        </ActionRow>

        <AppTextInput label="Nome" onChangeText={(value) => updateField('nome', value)} value={form.nome} />
        <AppTextInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={(value) => updateField('email', value)}
          value={form.email}
        />
        <AppTextInput
          label="Senha"
          onChangeText={(value) => updateField('senha', value)}
          secureTextEntry
          value={form.senha}
        />

        {role === 'aluno' ? (
          <>
            <AppSelect
              label="Curso"
              onChange={(value) => updateField('curso', value)}
              options={courses.map((course) => ({ label: course.nome, value: course.nome }))}
              placeholder={courses.length ? 'Selecione um curso' : 'Carregando cursos...'}
              value={form.curso}
            />
            <AppTextInput keyboardType="phone-pad" label="Telefone" onChangeText={updatePhone} value={form.telefone} />
            <AppTextInput keyboardType="numeric" label="CEP" onChangeText={(value) => updateField('cep', value)} value={form.cep} />
            <AppButton label="Consultar CEP" onPress={fillAddress} variant="secondary" />
            <AppTextInput label="Endereco" onChangeText={(value) => updateField('endereco', value)} value={form.endereco} />
            <AppTextInput label="Cidade" onChangeText={(value) => updateField('cidade', value)} value={form.cidade} />
            <AppTextInput autoCapitalize="characters" label="Estado" onChangeText={(value) => updateField('estado', value)} value={form.estado} />
          </>
        ) : null}

        {role === 'professor' ? (
          <>
            <AppTextInput label="Titulação" onChangeText={(value) => updateField('titulacao', value)} value={form.titulacao} />
            <AppMultiSelect
              label="Cursos"
              onChange={updateProfessorCourses}
              options={courses.map((course) => ({ label: course.nome, value: String(course.id) }))}
              placeholder={courses.length ? 'Selecione os cursos' : 'Cadastre cursos primeiro'}
              values={selectedProfessorCourseIds}
            />
            <AppMultiSelect
              disabled={!selectedProfessorCourseIds.length}
              label={`Disciplinas (${professorWeeklyHours}/40h)`}
              onChange={updateProfessorDisciplines}
              options={availableProfessorDisciplines.map((discipline) => ({
                label: `${discipline.nome}/${discipline.carga_horaria} horas semanais`,
                value: String(discipline.id),
              }))}
              placeholder={selectedProfessorCourseIds.length ? 'Selecione as disciplinas' : 'Escolha cursos primeiro'}
              values={selectedProfessorDisciplineIds}
            />
          </>
        ) : null}

        {feedback ? <SuccessBanner>{feedback}</SuccessBanner> : null}
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <AppButton
          disabled={isSubmitting}
          label={isSubmitting ? 'Cadastrando...' : 'Criar conta'}
          onPress={handleSubmit}
        />
      </FormSection>
    </ScreenContainer>
  );
}
