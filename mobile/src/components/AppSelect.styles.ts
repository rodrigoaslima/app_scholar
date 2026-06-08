import styled from 'styled-components/native';

export const SelectWrapper = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const SelectLabel = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: ${({ theme }) => theme.typography.body}px;
`;

export const SelectButton = styled.Pressable<{ $hasValue: boolean; $disabled?: boolean }>`
  background-color: ${({ theme }) => theme.colors.surface};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  justify-content: center;
  min-height: 54px;
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: 13px;
`;

export const SelectButtonText = styled.Text<{ $hasValue: boolean }>`
  color: ${({ theme, $hasValue }) => ($hasValue ? theme.colors.text : theme.colors.textMuted)};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.typography.bodyLarge}px;
`;

export const ModalBackdrop = styled.Pressable`
  background-color: rgba(0, 0, 0, 0.35);
  flex: 1;
  justify-content: flex-end;
`;

export const ModalPanel = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-left-radius: ${({ theme }) => theme.radius.lg}px;
  border-top-right-radius: ${({ theme }) => theme.radius.lg}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
  max-height: 70%;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const ModalTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.headingBold};
  font-size: ${({ theme }) => theme.typography.title}px;
`;

export const OptionButton = styled.Pressable<{ $active: boolean }>`
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primarySoft : theme.colors.surfaceMuted};
  border-color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const OptionLabel = styled.Text<{ $active: boolean }>`
  color: ${({ theme, $active }) => ($active ? theme.colors.primaryStrong : theme.colors.text)};
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: ${({ theme }) => theme.typography.bodyLarge}px;
`;
