import { Modal, ScrollView } from 'react-native';
import { useMemo, useState } from 'react';

import {
  ModalBackdrop,
  ModalPanel,
  ModalTitle,
  OptionButton,
  OptionLabel,
  SelectButton,
  SelectButtonText,
  SelectLabel,
  SelectWrapper,
} from './AppSelect.styles';

type SelectOption = {
  label: string;
  value: string;
};

type AppSelectProps = {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  value: string;
};

export function AppSelect({
  disabled = false,
  label,
  onChange,
  options,
  placeholder = 'Selecione',
  value,
}: AppSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  function selectOption(option: SelectOption) {
    onChange(option.value);
    setIsOpen(false);
  }

  return (
    <SelectWrapper>
      <SelectLabel>{label}</SelectLabel>
      <SelectButton
        $disabled={disabled}
        $hasValue={Boolean(selectedOption)}
        disabled={disabled}
        onPress={() => setIsOpen(true)}
      >
        <SelectButtonText $hasValue={Boolean(selectedOption)}>
          {selectedOption?.label || placeholder}
        </SelectButtonText>
      </SelectButton>

      <Modal animationType="slide" transparent visible={isOpen} onRequestClose={() => setIsOpen(false)}>
        <ModalBackdrop onPress={() => setIsOpen(false)}>
          <ModalPanel>
            <ModalTitle>{label}</ModalTitle>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <OptionButton
                  key={option.value}
                  $active={option.value === value}
                  onPress={() => selectOption(option)}
                >
                  <OptionLabel $active={option.value === value}>{option.label}</OptionLabel>
                </OptionButton>
              ))}
            </ScrollView>
          </ModalPanel>
        </ModalBackdrop>
      </Modal>
    </SelectWrapper>
  );
}
