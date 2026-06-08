import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView } from 'react-native';

import { AppButton } from '../components/AppButton';
import { MenuCard } from '../components/MenuCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Course, Discipline } from '../types/models';
import {
  ModalBackdrop,
  ModalItem,
  ModalPanel,
  ModalTitle,
  SummaryCard,
  SummaryGrid,
  SummaryLabel,
  SummaryValue,
} from './DashboardScreen.styles';

type Props = {
  navigate: (
    screen:
      | 'CourseRegistration'
      | 'Dashboard'
      | 'StudentRegistration'
      | 'ProfessorRegistration'
      | 'SubjectRegistration'
      | 'ReportCard'
  ) => void;
};

export function DashboardScreen({ navigate }: Props) {
  const { logout, token, user } = useAuth();
  const [summary, setSummary] = useState({
    students: 0,
    professors: 0,
    subjects: 0,
  });
  const [professorCourses, setProfessorCourses] = useState<Course[]>([]);
  const [professorDisciplines, setProfessorDisciplines] = useState<Discipline[]>([]);
  const [detailsModal, setDetailsModal] = useState<'courses' | 'disciplines' | null>(null);

  useEffect(() => {
    async function loadSummary() {
      if (!token || !user) {
        return;
      }

      try {
        if (user.role === 'administrador') {
          const [studentsResponse, professorsResponse, disciplinesResponse] = await Promise.all([
            api.listStudents(token),
            api.listProfessors(token),
            api.listDisciplines(token),
          ]);

          setSummary({
            students: studentsResponse.alunos.length,
            professors: professorsResponse.professores.length,
            subjects: disciplinesResponse.disciplinas.length,
          });
          return;
        }

        if (user.role === 'professor') {
          const [coursesResponse, disciplinesResponse] = await Promise.all([
            api.listProfessorCourses(token),
            api.listProfessorDisciplines(token),
          ]);

          setProfessorCourses(coursesResponse.cursos);
          setProfessorDisciplines(disciplinesResponse.disciplinas);
          setSummary({
            students: 0,
            professors: coursesResponse.cursos.length,
            subjects: disciplinesResponse.disciplinas.length,
          });
          return;
        }

        const response = await api.listMySubjects(token);
        setSummary({ students: 1, professors: 0, subjects: response.disciplinas.length });
      } catch {
        setSummary({ students: 0, professors: 0, subjects: 0 });
      }
    }

    loadSummary();
  }, [token, user]);

  const menu = useMemo(() => {
    if (user?.role === 'administrador') {
      return [
        {
          badge: '01',
          description: 'Cadastre cursos e vincule as disciplinas de cada curso.',
          screen: 'CourseRegistration' as const,
          title: 'Cadastrar Cursos',
        },
        {
          badge: '02',
          description: 'Cadastre disciplinas e defina suas horas semanais.',
          screen: 'SubjectRegistration' as const,
          title: 'Cadastrar Disciplinas',
        },
        {
          badge: '03',
          description: 'Gerencie professores e controle cursos, disciplinas e acesso.',
          screen: 'ProfessorRegistration' as const,
          title: 'Gerenciar Professores',
        },
        {
          badge: '04',
          description: 'Crie, acompanhe, bloqueie ou remova alunos do sistema.',
          screen: 'StudentRegistration' as const,
          title: 'Gerenciar Alunos',
        },
        {
          badge: '05',
          description: 'Consulte boletim pelo ID do aluno.',
          screen: 'ReportCard' as const,
          title: 'Consulta de Boletim',
        },
      ];
    }

    if (user?.role === 'professor') {
      return [
        {
          badge: '01',
          description: 'Veja suas materias vinculadas e lance ou altere notas.',
          screen: 'ReportCard' as const,
          title: 'Minhas Disciplinas e Notas',
        },
      ];
    }

    return [
      {
        badge: '01',
        description: 'Visualize suas materias e acompanhe as notas registradas.',
        screen: 'ReportCard' as const,
        title: 'Minhas Materias e Boletim',
      },
    ];
  }, [user?.role]);

  const isStudent = user?.role === 'aluno';
  const isAdmin = user?.role === 'administrador';
  const isProfessor = user?.role === 'professor';
  const modalItems = detailsModal === 'courses'
    ? professorCourses.map((course) => course.nome)
    : professorDisciplines.map((discipline) => discipline.nome);

  return (
    <ScreenContainer
      includeTopInset
      subtitle={user ? `Ola, ${user.nome}` : 'Acesse os modulos academicos da plataforma.'}
      title={isStudent ? 'Painel do aluno' : isAdmin ? 'Painel Administrativo' : 'Painel do Professor'}
    >
      <SummaryGrid>
        {isProfessor ? (
          <>
            <SummaryCard onPress={() => setDetailsModal('courses')}>
              <SummaryValue>{professorCourses.length}</SummaryValue>
              <SummaryLabel>Cursos</SummaryLabel>
            </SummaryCard>
            <SummaryCard onPress={() => setDetailsModal('disciplines')}>
              <SummaryValue>{professorDisciplines.length}</SummaryValue>
              <SummaryLabel>Disciplinas</SummaryLabel>
            </SummaryCard>
          </>
        ) : null}
        {!isStudent && !isProfessor ? (
          <>
            <SummaryCard disabled>
              <SummaryValue>{summary.students}</SummaryValue>
              <SummaryLabel>{user?.role === 'administrador' ? 'Alunos' : 'Aluno'}</SummaryLabel>
            </SummaryCard>
            <SummaryCard disabled>
              <SummaryValue>{summary.professors}</SummaryValue>
              <SummaryLabel>{user?.role === 'administrador' ? 'Professores' : 'Professor'}</SummaryLabel>
            </SummaryCard>
          </>
        ) : null}
        {!isProfessor ? (
          <SummaryCard disabled>
            <SummaryValue>{summary.subjects}</SummaryValue>
            <SummaryLabel>Materias</SummaryLabel>
          </SummaryCard>
        ) : null}
      </SummaryGrid>

      <Modal
        animationType="slide"
        transparent
        visible={Boolean(detailsModal)}
        onRequestClose={() => setDetailsModal(null)}
      >
        <ModalBackdrop onPress={() => setDetailsModal(null)}>
          <ModalPanel>
            <ModalTitle>{detailsModal === 'courses' ? 'Cursos' : 'Disciplinas'}</ModalTitle>
            <ScrollView showsVerticalScrollIndicator={false}>
              {modalItems.length ? (
                modalItems.map((item) => <ModalItem key={item}>{item}</ModalItem>)
              ) : (
                <ModalItem>Nenhum registro vinculado</ModalItem>
              )}
            </ScrollView>
            <AppButton label="Fechar" onPress={() => setDetailsModal(null)} variant="secondary" />
          </ModalPanel>
        </ModalBackdrop>
      </Modal>

      {menu.map((item) => (
        <MenuCard
          key={item.title}
          badge={item.badge}
          description={item.description}
          onPress={() => navigate(item.screen)}
          title={item.title}
        />
      ))}

      <AppButton label="Sair" onPress={logout} variant="ghost" />
    </ScreenContainer>
  );
}
