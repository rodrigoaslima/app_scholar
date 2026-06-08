import { Redirect } from 'expo-router';

import { StudentRegistrationScreen } from '../src/screens/StudentRegistrationScreen';
import { useAuth } from '../src/hooks/useAuth';

export default function StudentRegistrationRoute() {
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

  return <StudentRegistrationScreen />;
}
