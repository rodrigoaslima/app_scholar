import { Redirect } from 'expo-router';

import { useAuth } from '../src/hooks/useAuth';

export default function IndexRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return <Redirect href={isAuthenticated ? '/dashboard' : '/login'} />;
}
