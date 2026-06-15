import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView } from 'react-native';

import { AppButton } from '../components/AppButton';
import { MenuCard } from '../components/MenuCard';
import { NoticeCarousel } from '../components/NoticeCarousel';
import { ScreenContainer } from '../components/ScreenContainer';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Course, Discipline, MessageRecord, NoticeFeedItem } from '../types/models';
import {
  ModalBackdrop,
  ModalItem,
  ModalPanel,
  ModalTitle,
  NoticeActions,
  NoticeCounter,
  NoticeTextArea,
  ResultMessage,
  SummaryCard,
  SummaryGrid,
  SummaryLabel,
  SummaryValue,
} from './DashboardScreen.styles';

const NOTICE_MAX_LENGTH = 255;

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
    notices: 0,
  });
  const [professorCourses, setProfessorCourses] = useState<Course[]>([]);
  const [professorDisciplines, setProfessorDisciplines] = useState<Discipline[]>([]);
  const [noticeMessages, setNoticeMessages] = useState<MessageRecord[]>([]);
  const [studentNotices, setStudentNotices] = useState<NoticeFeedItem[]>([]);
  const [detailsModal, setDetailsModal] = useState<'courses' | 'disciplines' | 'notices' | null>(null);
  const [isNoticeModalVisible, setIsNoticeModalVisible] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [isSendingNotice, setIsSendingNotice] = useState(false);
  const [noticeResult, setNoticeResult] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    async function loadSummary() {
      if (!token || !user) {
        return;
      }

      try {
        if (user.role === 'administrador') {
          const [studentsResponse, professorsResponse, disciplinesResponse, messagesResponse] = await Promise.all([
            api.listStudents(token),
            api.listProfessors(token),
            api.listDisciplines(token),
            api.countMyMessages(token),
          ]);

          setSummary({
            students: studentsResponse.alunos.length,
            professors: professorsResponse.professores.length,
            subjects: disciplinesResponse.disciplinas.length,
            notices: messagesResponse.total,
          });
          return;
        }

        if (user.role === 'professor') {
          const [coursesResponse, disciplinesResponse, messagesResponse] = await Promise.all([
            api.listProfessorCourses(token),
            api.listProfessorDisciplines(token),
            api.countMyMessages(token),
          ]);

          setProfessorCourses(coursesResponse.cursos);
          setProfessorDisciplines(disciplinesResponse.disciplinas);
          setSummary({
            students: 0,
            professors: coursesResponse.cursos.length,
            subjects: disciplinesResponse.disciplinas.length,
            notices: messagesResponse.total,
          });
          return;
        }

        const response = await api.listMySubjects(token);
        setSummary({ students: 1, professors: 0, subjects: response.disciplinas.length, notices: 0 });

        const messagesResponse = await api.listStudentMessages(token);
        setStudentNotices(messagesResponse.avisos);
      } catch {
        setSummary({ students: 0, professors: 0, subjects: 0, notices: 0 });
        setStudentNotices([]);
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
  const canGenerateNotices = isAdmin || isProfessor;
  const modalItems = detailsModal === 'courses'
    ? professorCourses.map((course) => course.nome)
    : detailsModal === 'disciplines'
      ? professorDisciplines.map((discipline) => discipline.nome)
      : noticeMessages.map((message) => message.texto);

  function handleGenerateNotice() {
    setIsNoticeModalVisible(true);
  }

  async function handleOpenNoticeDetails() {
    if (!token) {
      setNoticeResult({
        type: 'error',
        title: 'Erro ao carregar',
        message: 'Sessao invalida. Entre novamente e tente outra vez.',
      });
      return;
    }

    try {
      const response = await api.listMyMessages(token);
      setNoticeMessages(response.msgs);
      setDetailsModal('notices');
    } catch (loadError) {
      setNoticeResult({
        type: 'error',
        title: 'Erro ao carregar',
        message: loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os avisos.',
      });
    }
  }

  function handleCloseNotice() {
    setIsNoticeModalVisible(false);
  }

  async function handleSendNotice() {
    const text = noticeMessage.trim();

    if (!text) {
      setNoticeResult({
        type: 'error',
        title: 'Erro ao enviar',
        message: 'Digite uma mensagem antes de enviar.',
      });
      return;
    }

    if (!token) {
      setNoticeResult({
        type: 'error',
        title: 'Erro ao enviar',
        message: 'Sessao invalida. Entre novamente e tente outra vez.',
      });
      return;
    }

    try {
      setIsSendingNotice(true);
      await api.createMessage(token, text);
      setSummary((current) => ({ ...current, notices: current.notices + 1 }));
      setNoticeMessage('');
      setIsNoticeModalVisible(false);
      setNoticeResult({
        type: 'success',
        title: 'Aviso enviado',
        message: 'Mensagem salva com sucesso.',
      });
    } catch (sendError) {
      setIsNoticeModalVisible(false);
      setNoticeResult({
        type: 'error',
        title: 'Erro ao enviar',
        message: sendError instanceof Error ? sendError.message : 'Nao foi possivel enviar o aviso.',
      });
    } finally {
      setIsSendingNotice(false);
    }
  }

  return (
    <ScreenContainer
      includeTopInset
      subtitle={user ? `Ola, ${user.nome}` : 'Acesse os modulos academicos da plataforma.'}
      title={isStudent ? 'Painel do aluno' : isAdmin ? 'Painel Administrativo' : 'Painel do Professor'}
    >
      {isStudent ? <NoticeCarousel items={studentNotices} /> : null}

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
        {canGenerateNotices ? (
          <SummaryCard onPress={handleOpenNoticeDetails}>
            <SummaryValue>{summary.notices}</SummaryValue>
            <SummaryLabel>Avisos</SummaryLabel>
          </SummaryCard>
        ) : null}
      </SummaryGrid>

      {canGenerateNotices ? (
        <AppButton label="Gerar Avisos" onPress={handleGenerateNotice} />
      ) : null}

      <Modal
        animationType="slide"
        transparent
        visible={isNoticeModalVisible}
        onRequestClose={() => setIsNoticeModalVisible(false)}
      >
        <ModalBackdrop>
          <ModalPanel>
            <ModalTitle>Gerar Aviso</ModalTitle>
            <NoticeTextArea
              maxLength={NOTICE_MAX_LENGTH}
              multiline
              onChangeText={setNoticeMessage}
              placeholder="Digite a mensagem do aviso"
              value={noticeMessage}
            />
            <NoticeCounter>
              {noticeMessage.length}/{NOTICE_MAX_LENGTH} caracteres
            </NoticeCounter>
            <NoticeActions>
              <AppButton label="Fechar" onPress={handleCloseNotice} variant="secondary" />
              <AppButton
                disabled={!noticeMessage.trim() || isSendingNotice}
                label={isSendingNotice ? 'Enviando...' : 'Enviar'}
                onPress={handleSendNotice}
              />
            </NoticeActions>
          </ModalPanel>
        </ModalBackdrop>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(noticeResult)}
        onRequestClose={() => setNoticeResult(null)}
      >
        <ModalBackdrop>
          <ModalPanel>
            <ModalTitle>{noticeResult?.title}</ModalTitle>
            {noticeResult ? (
              <ResultMessage $type={noticeResult.type}>{noticeResult.message}</ResultMessage>
            ) : null}
            <AppButton label="Ok" onPress={() => setNoticeResult(null)} />
          </ModalPanel>
        </ModalBackdrop>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={Boolean(detailsModal)}
        onRequestClose={() => setDetailsModal(null)}
      >
        <ModalBackdrop onPress={() => setDetailsModal(null)}>
          <ModalPanel>
            <ModalTitle>
              {detailsModal === 'courses' ? 'Cursos' : detailsModal === 'disciplines' ? 'Disciplinas' : 'Avisos'}
            </ModalTitle>
            <ScrollView showsVerticalScrollIndicator={false}>
              {modalItems.length ? (
                modalItems.map((item, index) => <ModalItem key={`${item}-${index}`}>{item}</ModalItem>)
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
