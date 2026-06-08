import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type {
  ApiUser,
  Course,
  Discipline,
  GradePayload,
  LoginPayload,
  RegisterPayload,
  StudentRecord,
  ProfessorRecord,
  SubjectRecord,
} from '../types/models';

export class ApiError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function getDevHost() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    return hostUri.split(':')[0];
  }

  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }

  return 'localhost';
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${getDevHost()}:3333/api`;

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new ApiError(data.mensagem || 'Nao foi possivel concluir a requisicao.', response.status, data.code);
  }

  return data as T;
}

export type AuthResponse = {
  token: string;
  usuario: ApiUser;
};

export const api = {
  login(payload: LoginPayload) {
    return apiRequest<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.credential,
        senha: payload.password,
      }),
    });
  },
  register(payload: RegisterPayload) {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  me(token: string) {
    return apiRequest<{ usuario: ApiUser }>('/me', { token });
  },
  listUsers(token: string) {
    return apiRequest<{ usuarios: ApiUser[] }>('/usuarios', { token });
  },
  setUserActive(token: string, id: number, ativo: boolean) {
    return apiRequest<{ mensagem: string }>(`/usuarios/${id}/acesso`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ ativo }),
    });
  },
  listStudents(token: string) {
    return apiRequest<{ alunos: StudentRecord[] }>('/alunos', { token });
  },
  listCourses() {
    return apiRequest<{ cursos: Course[] }>('/cursos');
  },
  createCourse(token: string, payload: { nome: string; disciplina_ids: number[] }) {
    return apiRequest<{ mensagem: string }>('/cursos', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },
  updateCourse(token: string, id: number, payload: { nome: string; disciplina_ids: number[] }) {
    return apiRequest<{ mensagem: string }>(`/cursos/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(payload),
    });
  },
  deleteCourse(token: string, id: number) {
    return apiRequest<{ mensagem: string }>(`/cursos/${id}`, { method: 'DELETE', token });
  },
  createStudent(token: string, payload: StudentRecord & { senha?: string }) {
    return apiRequest<{ mensagem: string }>('/alunos', {
      method: 'POST',
      token,
      body: JSON.stringify({
        nome: payload.nome || payload.name,
        email: payload.email,
        senha: payload.senha,
        curso: payload.curso || payload.course,
        telefone: payload.telefone || payload.phone,
        cep: payload.cep,
        endereco: payload.endereco || payload.address,
        cidade: payload.cidade || payload.city,
        estado: payload.estado || payload.state,
      }),
    });
  },
  updateStudent(token: string, id: number, payload: StudentRecord) {
    return apiRequest<{ mensagem: string }>(`/alunos/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({
        nome: payload.nome || payload.name,
        email: payload.email,
        curso: payload.curso || payload.course,
        telefone: payload.telefone || payload.phone,
        cep: payload.cep,
        endereco: payload.endereco || payload.address,
        cidade: payload.cidade || payload.city,
        estado: payload.estado || payload.state,
      }),
    });
  },
  deleteStudent(token: string, id: number) {
    return apiRequest<{ mensagem: string }>(`/alunos/${id}`, { method: 'DELETE', token });
  },
  listProfessors(token: string) {
    return apiRequest<{ professores: ProfessorRecord[] }>('/professores', { token });
  },
  createProfessor(token: string, payload: ProfessorRecord & { senha?: string }) {
    return apiRequest<{ mensagem: string }>('/professores', {
      method: 'POST',
      token,
      body: JSON.stringify({
        nome: payload.nome || payload.name,
        email: payload.email,
        senha: payload.senha,
        titulacao: payload.titulacao || payload.degree,
        curso_ids: payload.curso_ids,
        disciplina_ids: payload.disciplina_ids,
      }),
    });
  },
  updateProfessor(token: string, id: number, payload: ProfessorRecord) {
    return apiRequest<{ mensagem: string }>(`/professores/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({
        nome: payload.nome || payload.name,
        email: payload.email,
        titulacao: payload.titulacao || payload.degree,
        curso_ids: payload.curso_ids,
        disciplina_ids: payload.disciplina_ids,
      }),
    });
  },
  deleteProfessor(token: string, id: number) {
    return apiRequest<{ mensagem: string }>(`/professores/${id}`, { method: 'DELETE', token });
  },
  listDisciplines(token: string) {
    return apiRequest<{ disciplinas: Discipline[] }>('/disciplinas', { token });
  },
  createDiscipline(token: string, payload: SubjectRecord) {
    return apiRequest<{ mensagem: string }>('/disciplinas', {
      method: 'POST',
      token,
      body: JSON.stringify({
        nome: payload.nome || payload.name,
        carga_horaria: payload.carga_horaria || payload.workload,
      }),
    });
  },
  updateDiscipline(token: string, id: number, payload: SubjectRecord) {
    return apiRequest<{ mensagem: string }>(`/disciplinas/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({
        nome: payload.nome || payload.name,
        carga_horaria: payload.carga_horaria || payload.workload,
      }),
    });
  },
  deleteDiscipline(token: string, id: number) {
    return apiRequest<{ mensagem: string }>(`/disciplinas/${id}`, { method: 'DELETE', token });
  },
  assignProfessor(token: string, disciplinaId: number, professorId: number) {
    return apiRequest<{ mensagem: string }>(`/disciplinas/${disciplinaId}/professor`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ professor_id: professorId }),
    });
  },
  assignStudent(token: string, disciplinaId: number, alunoId: number) {
    return apiRequest<{ mensagem: string }>(`/disciplinas/${disciplinaId}/alunos`, {
      method: 'POST',
      token,
      body: JSON.stringify({ aluno_id: alunoId }),
    });
  },
  listProfessorDisciplines(token: string) {
    return apiRequest<{ disciplinas: Discipline[] }>('/professor/disciplinas', { token });
  },
  listProfessorCourses(token: string) {
    return apiRequest<{ cursos: Course[] }>('/professor/cursos', { token });
  },
  listDisciplineStudents(token: string, disciplinaId: number) {
    return apiRequest<{ alunos: StudentRecord[] }>(`/professor/disciplinas/${disciplinaId}/alunos`, { token });
  },
  saveGrade(token: string, payload: GradePayload) {
    return apiRequest<{ mensagem: string }>('/professor/notas', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },
  listMySubjects(token: string) {
    return apiRequest<{ disciplinas: Discipline[] }>('/aluno/materias', { token });
  },
  listMyGrades(token: string) {
    return apiRequest<{ aluno: string; disciplinas: Discipline[] }>('/aluno/notas', { token });
  },
  getReport(token: string, matricula: string) {
    return apiRequest<{ aluno: string; disciplinas: Discipline[] }>(`/boletim/${matricula}`, { token });
  },
};

export async function fetchAddressByCep(cep: string) {
  const cleanCep = cep.replace(/\D/g, '');

  if (cleanCep.length !== 8) {
    throw new ApiError('CEP nao encontrado.', 404, 'CEP_NOT_FOUND');
  }

  return apiRequest<{
    logradouro: string;
    localidade: string;
    uf: string;
  }>(`/cep/${cleanCep}`);
}

export async function fetchStates() {
  const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
  return response.json() as Promise<Array<{ id: number; nome: string; sigla: string }>>;
}

export async function fetchCitiesByState(uf: string) {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
  );
  return response.json() as Promise<Array<{ id: number; nome: string }>>;
}
