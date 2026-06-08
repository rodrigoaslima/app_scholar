import styled from 'styled-components/native';

type StatusProps = {
  status: 'Aprovado' | 'Recuperacao' | 'Reprovado';
};

export const LoadingCard = styled.View`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  border-width: 1px;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

export const LoadingText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.bodyMedium};
  font-size: ${({ theme }) => theme.typography.bodyLarge}px;
`;

export const ErrorBanner = styled.Text`
  background-color: ${({ theme }) => theme.colors.dangerSoft};
  border-radius: ${({ theme }) => theme.radius.md}px;
  color: ${({ theme }) => theme.colors.danger};
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: ${({ theme }) => theme.typography.body}px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: 12px;
`;

export const ReportCardSurface = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  border-width: 1px;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  shadow-color: #0f172a;
  shadow-offset: 0px 12px;
  shadow-opacity: 0.05;
  shadow-radius: 24px;
  elevation: 2;
`;

export const ReportHeader = styled.View`
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const DisciplineName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.headingBold};
  font-size: 20px;
`;

export const StatusBadge = styled.Text<StatusProps>`
  background-color: ${({ theme, status }) =>
    status === 'Aprovado'
      ? theme.colors.successSoft
      : status === 'Recuperacao'
        ? theme.colors.accentSoft
        : theme.colors.dangerSoft};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  color: ${({ theme, status }) =>
    status === 'Aprovado'
      ? theme.colors.success
      : status === 'Recuperacao'
        ? theme.colors.accent
        : theme.colors.danger};
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => theme.typography.caption}px;
  overflow: hidden;
  padding-horizontal: 12px;
  padding-vertical: 7px;
  text-transform: uppercase;
`;

export const MetricGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const MetricCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  min-width: 47%;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const MetricLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: ${({ theme }) => theme.typography.caption}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  text-transform: uppercase;
`;

export const MetricValue = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.headingBold};
  font-size: 19px;
`;
