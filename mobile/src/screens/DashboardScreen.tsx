import { useEffect, useMemo, useState } from 'react';

import { AppButton } from '../components/AppButton';
import { MenuCard } from '../components/MenuCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import {
  SummaryCard,
  SummaryGrid,
  SummaryLabel,
  SummaryValue,
  WelcomePanel,
  WelcomePanelMeta,
  WelcomePanelTitle,
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
          const response = await api.listProfessorDisciplines(token);
          setSummary({ students: 0, professors: 1, subjects: response.disciplinas.length });
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

  return (
    <ScreenContainer
      includeTopInset
      subtitle={user ? `Ola, ${user.nome}` : 'Acesse os modulos academicos da plataforma.'}
      title={isStudent ? 'Painel do aluno' : isAdmin ? 'Painel Administrativo' : 'Dashboard Academico'}
    >
      {!isStudent && !isAdmin ? (
        <WelcomePanel>
          <WelcomePanelTitle>Painel do professor</WelcomePanelTitle>
          <WelcomePanelMeta>
            Seu acesso esta limitado automaticamente pelo perfil da conta e validado pela API.
          </WelcomePanelMeta>
        </WelcomePanel>
      ) : null}

      <SummaryGrid>
        {!isStudent ? (
          <>
            <SummaryCard>
              <SummaryValue>{summary.students}</SummaryValue>
              <SummaryLabel>{user?.role === 'administrador' ? 'Alunos' : 'Aluno'}</SummaryLabel>
            </SummaryCard>
            <SummaryCard>
              <SummaryValue>{summary.professors}</SummaryValue>
              <SummaryLabel>{user?.role === 'administrador' ? 'Professores' : 'Professor'}</SummaryLabel>
            </SummaryCard>
          </>
        ) : null}
        <SummaryCard>
          <SummaryValue>{summary.subjects}</SummaryValue>
          <SummaryLabel>Materias</SummaryLabel>
        </SummaryCard>
      </SummaryGrid>

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
