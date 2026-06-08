import { Redirect } from 'expo-router';

import { useAuth } from '../src/hooks/useAuth';
import { ReportCardScreen } from '../src/screens/ReportCardScreen';

export default function ReportCardRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <ReportCardScreen />;
}
