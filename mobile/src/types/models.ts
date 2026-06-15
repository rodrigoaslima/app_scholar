export type UserRole = 'aluno' | 'professor' | 'administrador';

export type ApiUser = {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  ativo: boolean;
};

export type User = ApiUser;

export type LoginPayload = {
  credential: string;
  password: string;
};

export type RegisterPayload = {
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  matricula?: string;
  curso?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  titulacao?: string;
  area?: string;
  curso_ids?: number[];
  disciplina_ids?: number[];
};

export type StudentRecord = {
  id?: number;
  usuario_id?: number;
  name: string;
  nome?: string;
  senha?: string;
  ativo?: boolean;
  registration: string;
  matricula?: string;
  course: string;
  curso?: string;
  email: string;
  phone: string;
  telefone?: string;
  cep: string;
  address: string;
  endereco?: string;
  city: string;
  cidade?: string;
  state: string;
  estado?: string;
  nota1?: number;
  nota2?: number;
  media?: number;
  situacao?: ReportEntry['status'];
  disciplinas?: Pick<Discipline, 'id' | 'nome' | 'carga_horaria'>[];
  disciplina_ids?: number[];
};

export type ProfessorRecord = {
  id?: number;
  usuario_id?: number;
  name: string;
  nome?: string;
  senha?: string;
  ativo?: boolean;
  degree: string;
  titulacao?: string;
  specialty?: string;
  area?: string;
  email: string;
  cursos?: Course[];
  disciplinas?: Pick<Discipline, 'id' | 'nome' | 'carga_horaria'>[];
  curso_ids?: number[];
  disciplina_ids?: number[];
};

export type SubjectRecord = {
  id?: number;
  name: string;
  nome?: string;
  workload: string;
  carga_horaria?: string | number;
  professor?: string;
  professor_id?: number | string | null;
  course?: string;
  curso?: string;
  semester?: string;
  semestre?: string;
};

export type ReportEntry = {
  id: string;
  discipline: string;
  grade1: number;
  grade2: number;
  average: number;
  status: 'Aprovado' | 'Recuperacao' | 'Reprovado';
};

export type Discipline = {
  id: number;
  nome: string;
  carga_horaria: number;
  curso: string;
  semestre: string;
  professor_id?: number | null;
  professor_nome?: string | null;
  disciplina?: string;
  nota1?: number | null;
  nota2?: number | null;
  media?: number | null;
  situacao?: ReportEntry['status'] | null;
};

export type GradePayload = {
  aluno_id: number;
  disciplina_id: number;
  nota1: number;
  nota2: number;
};

export type MessageRecord = {
  id: number;
  texto: string;
  usuario_id: number;
  created_at: string;
  chip?: string;
};

export type NoticeFeedItem = {
  id: number;
  texto: string;
  usuario_id: number;
  created_at: string;
  chip: string;
};

export type Course = {
  id: number;
  nome: string;
  disciplinas?: Pick<Discipline, 'id' | 'nome' | 'carga_horaria'>[];
};
