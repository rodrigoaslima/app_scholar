import styled from 'styled-components/native';

type InputProps = {
  $hasError: boolean;
};

export const FieldWrapper = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const FieldLabel = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: ${({ theme }) => theme.typography.body}px;
`;

export const FieldInput = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.textMuted,
}))<InputProps>`
  background-color: ${({ theme }) => theme.colors.surface};
  border-color: ${({ theme, $hasError }) =>
    $hasError ? theme.colors.danger : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.typography.bodyLarge}px;
  min-height: 54px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  padding-vertical: 13px;
`;

export const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.typography.body}px;
`;
