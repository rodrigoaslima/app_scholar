import { Redirect } from 'expo-router';

import { useAuth } from '../src/hooks/useAuth';
import { CourseRegistrationScreen } from '../src/screens/CourseRegistrationScreen';

export default function CourseRegistrationRoute() {
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

  return <CourseRegistrationScreen />;
}
