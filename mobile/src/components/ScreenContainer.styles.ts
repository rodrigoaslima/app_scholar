import styled from 'styled-components/native';

export const ScreenSurface = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  flex: 1;
`;

export const ScrollBody = styled.ScrollView.attrs({
  contentContainerStyle: { flexGrow: 1 },
  keyboardShouldPersistTaps: 'handled',
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

export const ScreenBody = styled.View`
  flex: 1;
`;

export const Content = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const HeaderCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-color: ${({ theme }) => theme.colors.border};
  border-left-color: ${({ theme }) => theme.colors.primary};
  border-left-width: 6px;
  border-radius: ${({ theme }) => theme.radius.xl}px;
  border-width: 1px;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing.lg}px;
  shadow-color: #111111;
  shadow-offset: 0px 10px;
  shadow-opacity: 0.05;
  shadow-radius: 20px;
  elevation: 3;
`;

export const HeaderTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.headingExtraBold};
  font-size: ${({ theme }) => theme.typography.headline}px;
`;

export const HeaderSubtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.typography.bodyLarge}px;
  line-height: 24px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;
