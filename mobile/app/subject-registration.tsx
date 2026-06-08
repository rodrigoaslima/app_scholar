import { Redirect } from 'expo-router';

import { useAuth } from '../src/hooks/useAuth';
import { SubjectRegistrationScreen } from '../src/screens/SubjectRegistrationScreen';

export default function SubjectRegistrationRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (user?.role !== 'administrador') {
    return <Redirect href="/dashboard" />;
  }

  return <SubjectRegistrationScreen />;
}
