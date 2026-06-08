import styled from 'styled-components/native';

export const WelcomePanel = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-color: ${({ theme }) => theme.colors.border};
  border-left-color: ${({ theme }) => theme.colors.primary};
  border-left-width: 5px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border-width: 1px;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

export const WelcomePanelTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.headingBold};
  font-size: 18px;
`;

export const WelcomePanelMeta = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.typography.body}px;
  line-height: 22px;
`;

export const SummaryGrid = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const SummaryCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-color: ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-top-width: 4px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border-width: 1px;
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const SummaryValue = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.headingExtraBold};
  font-size: 30px;
`;

export const SummaryLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: ${({ theme }) => theme.typography.caption}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  text-transform: uppercase;
`;
