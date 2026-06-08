import { Redirect, useRouter } from 'expo-router';

import { useAuth } from '../src/hooks/useAuth';
import { LoginScreen } from '../src/screens/LoginScreen';

export default function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/dashboard" />;
  }

  return <LoginScreen onRegisterPress={() => router.push('/register')} />;
}
