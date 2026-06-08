import { Redirect, useRouter } from 'expo-router';

import { useAuth } from '../src/hooks/useAuth';
import { DashboardScreen } from '../src/screens/DashboardScreen';

export default function DashboardRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <DashboardScreen
      navigate={(screen) => {
        const hrefMap = {
          CourseRegistration: '/course-registration',
          Dashboard: '/dashboard',
          StudentRegistration: '/student-registration',
          ProfessorRegistration: '/professor-registration',
          SubjectRegistration: '/subject-registration',
          ReportCard: '/report-card',
        } as const;

        router.push(hrefMap[screen]);
      }}
    />
  );
}
