import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';

import { AcademicDataProvider } from '../src/context/AcademicDataContext';
import { AuthProvider } from '../src/context/AuthContext';
import { theme } from '../src/styles/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSans_400Regular: require('../node_modules/@expo-google-fonts/noto-sans/400Regular/NotoSans_400Regular.ttf'),
    NotoSans_500Medium: require('../node_modules/@expo-google-fonts/noto-sans/500Medium/NotoSans_500Medium.ttf'),
    NotoSans_600SemiBold: require('../node_modules/@expo-google-fonts/noto-sans/600SemiBold/NotoSans_600SemiBold.ttf'),
    NotoSans_700Bold: require('../node_modules/@expo-google-fonts/noto-sans/700Bold/NotoSans_700Bold.ttf'),
    Raleway_700Bold: require('../node_modules/@expo-google-fonts/raleway/700Bold/Raleway_700Bold.ttf'),
    Raleway_800ExtraBold: require('../node_modules/@expo-google-fonts/raleway/800ExtraBold/Raleway_800ExtraBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <AcademicDataProvider>
            <Stack
              screenOptions={{
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: theme.colors.background },
                headerShadowVisible: false,
                headerStyle: { backgroundColor: theme.colors.surface },
                headerTintColor: theme.colors.primary,
                headerTitleStyle: {
                  color: theme.colors.text,
                  fontFamily: theme.fonts.headingBold,
                  fontSize: 18,
                },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ title: 'Cadastro de Usuario' }} />
              <Stack.Screen name="dashboard" options={{ headerShown: false }} />
              <Stack.Screen
                name="course-registration"
                options={{ title: 'Cadastro de Cursos' }}
              />
              <Stack.Screen
                name="student-registration"
                options={{ title: 'Cadastro de Alunos' }}
              />
              <Stack.Screen
                name="professor-registration"
                options={{ title: 'Cadastro de Professores' }}
              />
              <Stack.Screen
                name="subject-registration"
                options={{ title: 'Cadastrar Disciplinas' }}
              />
              <Stack.Screen
                name="report-card"
                options={{ title: 'Consulta de Boletim' }}
              />
            </Stack>
            <StatusBar style="dark" />
          </AcademicDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
