import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { NoticeCarousel } from '../components/NoticeCarousel';
import { api, ApiError } from '../services/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAuth } from '../hooks/useAuth';
import type { NoticeFeedItem } from '../types/models';
import {
  ErrorBanner,
  FormCard,
  FormSubtitle,
  FormTitle,
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
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [newsItems, setNewsItems] = useState<NoticeFeedItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (credential.trim() && password.trim()) {
      setErrors({});
      setFormError('');
    }
  }, [credential, password]);

  useEffect(() => {
    api.listAdminMessages()
      .then((response) => setNewsItems(response.avisos))
      .catch(() => setNewsItems([]));
  }, []);

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
      <NoticeCarousel items={newsItems} />

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
