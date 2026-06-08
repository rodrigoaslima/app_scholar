import styled from 'styled-components/native';

export const FormSection = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  border-width: 1px;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  shadow-color: #0f172a;
  shadow-offset: 0px 10px;
  shadow-opacity: 0.05;
  shadow-radius: 22px;
  elevation: 2;
`;

export const FormHelper = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.typography.body}px;
  line-height: 22px;
`;

export const SuccessBanner = styled.Text`
  background-color: ${({ theme }) => theme.colors.successSoft};
  border-radius: ${({ theme }) => theme.radius.md}px;
  color: ${({ theme }) => theme.colors.success};
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: ${({ theme }) => theme.typography.body}px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: 12px;
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

export const ActionRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const OptionButton = styled.Pressable<{ $active?: boolean }>`
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.surfaceMuted};
  border-color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  border-width: 1px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: 11px;
`;

export const OptionText = styled.Text<{ $active?: boolean }>`
  color: ${({ theme, $active }) => ($active ? theme.colors.textOnPrimary : theme.colors.text)};
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => theme.typography.body}px;
`;

export const DataCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border-width: 1px;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const DataActionCard = styled.Pressable`
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border-width: 1px;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const DataTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.headingBold};
  font-size: 17px;
`;

export const DataMeta = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.typography.body}px;
  line-height: 21px;
`;
