import { useEffect, useState } from 'react';
import { Alert, useWindowDimensions } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { ApiError } from '../services/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAuth } from '../hooks/useAuth';
import {
  ErrorBanner,
  FormCard,
  FormSubtitle,
  FormTitle,
  NewsBadge,
  NewsCard,
  NewsDate,
  NewsDescription,
  NewsDot,
  NewsDots,
  NewsScroll,
  NewsTitle,
} from './LoginScreen.styles';

type LoginErrors = {
  credential?: string;
  password?: string;
};

type Props = {
  onRegisterPress: () => void;
};

export function LoginScreen({ onRegisterPress }: Props) {
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const newsItems = [
    {
      id: '1',
      badge: 'Comunicado',
      title: 'Periodo de rematricula para o semestre 2026.2 sera aberto na proxima semana.',
      description:
        'Os alunos deverao atualizar dados cadastrais e acompanhar a liberacao das disciplinas diretamente pelo sistema academico.',
      date: 'Atualizado hoje',
    },
    {
      id: '2',
      badge: 'Academico',
      title: 'Acompanhamento de notas agora respeita perfis de aluno, professor e administrador.',
      description:
        'Cada usuario acessa apenas os recursos permitidos pela sua funcao institucional.',
      date: 'Controle por perfil',
    },
    {
      id: '3',
      badge: 'Secretaria',
      title: 'Cadastros iniciais podem ser criados diretamente pelo aplicativo.',
      description:
        'O primeiro acesso esta liberado para registro de aluno, professor ou administrador.',
      date: 'Cadastro aberto',
    },
  ];

  const newsCardWidth = Math.max(width - 32, 280);

  useEffect(() => {
    if (credential.trim() && password.trim()) {
      setErrors({});
      setFormError('');
    }
  }, [credential, password]);

  async function handleLogin() {
    const nextErrors: LoginErrors = {};

    if (!credential.trim()) {
      nextErrors.credential = 'Informe seu email.';
    }

    if (!password.trim()) {
      nextErrors.password = 'Informe sua senha.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      await login({
        credential: credential.trim(),
        password: password.trim(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel entrar.';

      if (error instanceof ApiError && error.code === 'ACCESS_BLOCKED') {
        Alert.alert('Acesso bloqueado', 'Acesso bloqueado, procurar a administracao');
      }

      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer
      includeTopInset
      title="App Scholar"
    >
      <NewsScroll
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / newsCardWidth
          );
          setActiveNewsIndex(index);
        }}
      >
        {newsItems.map((item) => (
          <NewsCard key={item.id} style={{ width: newsCardWidth }}>
            <NewsBadge>{item.badge}</NewsBadge>
            <NewsTitle>{item.title}</NewsTitle>
            <NewsDescription>{item.description}</NewsDescription>
            <NewsDate>{item.date}</NewsDate>
          </NewsCard>
        ))}
      </NewsScroll>

      <NewsDots>
        {newsItems.map((item, index) => (
          <NewsDot key={item.id} $active={index === activeNewsIndex} />
        ))}
      </NewsDots>

      <FormCard>
        <FormTitle>Autenticacao</FormTitle>
        <FormSubtitle>
          Entre com suas credenciais para acessar os modulos academicos conforme seu perfil.
        </FormSubtitle>

        <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.credential}
          keyboardType="email-address"
          label="Email"
          onChangeText={setCredential}
          placeholder="aluno@appscholar.com"
          value={credential}
        />

        <AppTextInput
          error={errors.password}
          label="Senha"
          onChangeText={setPassword}
          placeholder="Digite sua senha"
          secureTextEntry
          value={password}
        />

        {(errors.credential || errors.password) && (
          <ErrorBanner>Preencha os campos obrigatorios antes de continuar.</ErrorBanner>
        )}

        {formError ? <ErrorBanner>{formError}</ErrorBanner> : null}

        <AppButton
          disabled={isSubmitting}
          label={isSubmitting ? 'Entrando...' : 'Entrar'}
          onPress={handleLogin}
        />
        <AppButton
          disabled={isSubmitting}
          label="Criar cadastro"
          onPress={onRegisterPress}
          variant="ghost"
        />
      </FormCard>
    </ScreenContainer>
  );
}
