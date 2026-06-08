import styled from 'styled-components/native';

type VariantProps = {
  $disabled?: boolean;
  variant: 'primary' | 'secondary' | 'ghost';
};

export const ButtonRoot = styled.Pressable<VariantProps>`
  align-items: center;
  background-color: ${({ theme, variant }) =>
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
        ? theme.colors.secondary
        : 'transparent'};
  border-color: ${({ theme, variant }) =>
    variant === 'ghost' ? theme.colors.primary : 'transparent'};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  border-width: ${({ variant }) => (variant === 'ghost' ? 1 : 0)}px;
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
  justify-content: center;
  min-height: 54px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
  padding-vertical: 14px;
`;

export const ButtonLabel = styled.Text<VariantProps>`
  color: ${({ theme, variant }) =>
    variant === 'ghost' ? theme.colors.primary : theme.colors.textOnPrimary};
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => theme.typography.bodyLarge}px;
`;
