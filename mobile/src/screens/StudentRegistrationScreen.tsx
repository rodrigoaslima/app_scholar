import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppSelect } from '../components/AppSelect';
import { AppTextInput } from '../components/AppTextInput';
import { ScreenContainer } from '../components/ScreenContainer';
import { api, fetchAddressByCep } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Course, StudentRecord } from '../types/models';
import { formatPhone } from '../utils/formatters';
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

const initialForm: StudentRecord = {
  name: '',
  senha: '',
  registration: '',
  course: '',
  email: '',
  phone: '',
  cep: '',
  address: '',
  city: '',
  state: '',
};

export function StudentRegistrationScreen() {
  const { token, user } = useAuth();
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [form, setForm] = useState<StudentRecord>(initialForm);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function loadStudents() {
    if (!token) {
      return;
    }

    try {
      const response = await api.listStudents(token);
      setStudents(response.alunos);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar alunos.');
    }
  }

  useEffect(() => {
    loadStudents();
  }, [token]);

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await api.listCourses();
        setCourses(response.cursos);
      } catch {
        setError('Nao foi possivel carregar cursos.');
      }
    }

    loadCourses();
  }, []);

  function updateField(field: keyof StudentRecord, value: string) {
    setFeedback('');
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updatePhone(value: string) {
    updateField('phone', formatPhone(value));
  }

  function resetForm() {
    setEditingStudentId(null);
    setForm(initialForm);
  }

  function selectStudent(student: StudentRecord) {
    setFeedback('');
    setError('');
    setEditingStudentId(student.id || null);
    setForm({
      name: student.nome || student.name || '',
      senha: '',
      registration: String(student.id || student.matricula || ''),
      course: student.curso || student.course || '',
      email: student.email || '',
      phone: student.telefone || student.phone || '',
      cep: student.cep || '',
      address: student.endereco || student.address || '',
      city: student.cidade || student.city || '',
      state: student.estado || student.state || '',
    });
  }

  async function fillAddress() {
    try {
      const address = await fetchAddressByCep(form.cep);
      setForm((current) => ({
        ...current,
        address: address.logradouro,
        city: address.localidade,
        state: address.uf,
      }));
      setFeedback('Endereco preenchido pela ViaCEP.');
    } catch (addressError) {
      Alert.alert('Erro', 'CEP não encontrado');
      setError(addressError instanceof Error ? addressError.message : 'CEP invalido.');
    }
  }

  async function handleSubmit() {
    if (!token || user?.role !== 'administrador') {
      setError('Somente administrador pode gerenciar aluno.');
      return;
    }

    if (!form.name.trim() || !form.email.trim() || !form.course.trim()) {
      setError('Nome, email e curso sao obrigatorios.');
      return;
    }

    if (!editingStudentId && !form.senha?.trim()) {
      setError('Senha e obrigatoria para novo aluno.');
      return;
    }

    try {
      setIsLoading(true);

      if (editingStudentId) {
        await api.updateStudent(token, editingStudentId, form);
        setFeedback('Aluno atualizado com sucesso.');
      } else {
        await api.createStudent(token, form);
        setFeedback('Aluno cadastrado com sucesso.');
      }

      resetForm();
      await loadStudents();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nao foi possivel salvar aluno.');
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleAccess() {
    if (!token || !editingStudentId) {
      return;
    }

    const student = students.find((item) => item.id === editingStudentId);

    if (!student?.usuario_id) {
      return;
    }

    try {
      await api.setUserActive(token, student.usuario_id, !student.ativo);
      await loadStudents();
    } catch (accessError) {
      setError(accessError instanceof Error ? accessError.message : 'Nao foi possivel alterar acesso.');
    }
  }

  async function removeSelectedStudent() {
    if (!token || !editingStudentId) {
      return;
    }

    Alert.alert('Remover aluno', 'Deseja remover este aluno?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteStudent(token, editingStudentId);
            setFeedback('Aluno removido com sucesso.');
            resetForm();
            await loadStudents();
          } catch (removeError) {
            setError(removeError instanceof Error ? removeError.message : 'Nao foi possivel remover aluno.');
          }
        },
      },
    ]);
  }

  const editingStudent = students.find((student) => student.id === editingStudentId);

  return (
    <ScreenContainer
      subtitle="Cadastre alunos, consulte registros e bloqueie ou remova acessos."
      title="Gerenciar Alunos"
    >
      <FormSection>
        <FormHelper>Cadastre e Gerencie os Alunos</FormHelper>

        <AppTextInput label="Nome" onChangeText={(value) => updateField('name', value)} value={form.name} />
        <AppTextInput autoCapitalize="none" keyboardType="email-address" label="Email" onChangeText={(value) => updateField('email', value)} value={form.email} />
        {!editingStudentId ? (
          <AppTextInput label="Senha inicial" onChangeText={(value) => updateField('senha', value)} secureTextEntry value={form.senha} />
        ) : null}
        <AppSelect
          label="Curso"
          onChange={(value) => updateField('course', value)}
          options={courses.map((course) => ({ label: course.nome, value: course.nome }))}
          placeholder={courses.length ? 'Selecione um curso' : 'Carregando cursos...'}
          value={form.course}
        />
        <AppTextInput keyboardType="phone-pad" label="Telefone" onChangeText={updatePhone} value={form.phone} />
        <AppTextInput keyboardType="numeric" label="CEP" onChangeText={(value) => updateField('cep', value)} value={form.cep} />
        <AppButton label="Consultar CEP" onPress={fillAddress} variant="secondary" />
        <AppTextInput label="Endereco" onChangeText={(value) => updateField('address', value)} value={form.address} />
        <AppTextInput label="Cidade" onChangeText={(value) => updateField('city', value)} value={form.city} />
        <AppTextInput autoCapitalize="characters" label="Estado" onChangeText={(value) => updateField('state', value)} value={form.state} />

        {feedback ? <SuccessBanner>{feedback}</SuccessBanner> : null}
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <AppButton
          disabled={isLoading}
          label={isLoading ? 'Salvando...' : editingStudentId ? 'Atualizar aluno' : 'Salvar aluno'}
          onPress={handleSubmit}
        />
        {editingStudentId ? (
          <ActionRow>
            <AppButton label="Cancelar edicao" onPress={resetForm} variant="secondary" />
            <AppButton
              label={editingStudent?.ativo ? 'Bloquear acesso' : 'Desbloquear acesso'}
              onPress={toggleAccess}
              variant="secondary"
            />
            <AppButton label="Remover aluno" onPress={removeSelectedStudent} variant="ghost" />
          </ActionRow>
        ) : null}
      </FormSection>

      {students.map((student) => (
        <DataActionCard key={student.id} onPress={() => selectStudent(student)}>
          <DataTitle>{student.nome || student.name}</DataTitle>
          <DataMeta>
            ID do aluno: {student.id} | Curso: {student.curso || student.course}
          </DataMeta>
          <DataMeta>Email: {student.email}</DataMeta>
          <DataMeta>Status: {student.ativo ? 'Ativo' : 'Bloqueado'} | Toque para editar</DataMeta>
        </DataActionCard>
      ))}
    </ScreenContainer>
  );
}
