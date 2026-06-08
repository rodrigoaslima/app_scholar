import { TextInputProps } from 'react-native';

import {
  ErrorText,
  FieldInput,
  FieldLabel,
  FieldWrapper,
} from './AppTextInput.styles';

type AppTextInputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AppTextInput({ label, error, ...props }: AppTextInputProps) {
  return (
    <FieldWrapper>
      <FieldLabel>{label}</FieldLabel>
      <FieldInput $hasError={Boolean(error)} {...props} />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </FieldWrapper>
  );
}
