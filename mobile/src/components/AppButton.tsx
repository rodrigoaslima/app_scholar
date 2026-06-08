import { ButtonLabel, ButtonRoot } from './AppButton.styles';

type AppButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function AppButton({
  disabled = false,
  label,
  onPress,
  variant = 'primary',
}: AppButtonProps) {
  return (
    <ButtonRoot disabled={disabled} onPress={onPress} variant={variant} $disabled={disabled}>
      <ButtonLabel variant={variant} $disabled={disabled}>{label}</ButtonLabel>
    </ButtonRoot>
  );
}
