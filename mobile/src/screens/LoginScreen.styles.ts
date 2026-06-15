import styled from 'styled-components/native';

export const FormCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  border-width: 1px;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  shadow-color: #0f172a;
  shadow-offset: 0px 14px;
  shadow-opacity: 0.05;
  shadow-radius: 24px;
  elevation: 3;
`;

export const FormTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.headingBold};
  font-size: ${({ theme }) => theme.typography.title}px;
`;

export const FormSubtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.typography.body}px;
  line-height: 22px;
`;

export const ErrorBanner = styled.Text`
  background-color: ${({ theme }) => theme.colors.dangerSoft};
  border-radius: ${({ theme }) => theme.radius.md}px;
  color: ${({ theme }) => theme.colors.danger};
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: ${({ theme }) => theme.typography.body}px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: 12px;
`;
