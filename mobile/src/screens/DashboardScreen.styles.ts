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

export const SummaryCard = styled.Pressable`
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

export const ModalBackdrop = styled.Pressable`
  background-color: rgba(15, 23, 42, 0.45);
  flex: 1;
  justify-content: flex-end;
`;

export const ModalPanel = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-left-radius: ${({ theme }) => theme.radius.lg}px;
  border-top-right-radius: ${({ theme }) => theme.radius.lg}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
  max-height: 65%;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

export const ModalTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.headingBold};
  font-size: ${({ theme }) => theme.typography.title}px;
`;

export const ModalItem = styled.Text`
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: ${({ theme }) => theme.typography.bodyLarge}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const NoticeTextArea = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.textMuted,
  textAlignVertical: 'top',
}))`
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.typography.bodyLarge}px;
  min-height: 150px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: ${({ theme }) => theme.spacing.md}px;
`;

export const NoticeCounter = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: ${({ theme }) => theme.typography.caption}px;
  text-align: right;
`;

export const NoticeActions = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const ResultMessage = styled.Text<{ $type: 'success' | 'error' }>`
  background-color: ${({ theme, $type }) =>
    $type === 'success' ? theme.colors.successSoft : theme.colors.dangerSoft};
  border-radius: ${({ theme }) => theme.radius.md}px;
  color: ${({ theme, $type }) =>
    $type === 'success' ? theme.colors.success : theme.colors.danger};
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: ${({ theme }) => theme.typography.body}px;
  line-height: 22px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: 12px;
`;
