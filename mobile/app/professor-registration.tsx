import { Redirect } from 'expo-router';

import { useAuth } from '../src/hooks/useAuth';
import { ProfessorRegistrationScreen } from '../src/screens/ProfessorRegistrationScreen';

export default function ProfessorRegistrationRoute() {
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

  return <ProfessorRegistrationScreen />;
}
