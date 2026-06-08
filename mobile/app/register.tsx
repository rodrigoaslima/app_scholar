import { useRouter } from 'expo-router';

import { RegisterScreen } from '../src/screens/RegisterScreen';

export default function RegisterRoute() {
  const router = useRouter();

  return <RegisterScreen onDone={() => router.replace('/dashboard')} />;
}
