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
import { AppButton } from './AppButton';

type MultiSelectOption = {
  label: string;
  value: string;
};

type AppMultiSelectProps = {
  disabled?: boolean;
  label: string;
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  values: string[];
};

export function AppMultiSelect({
  disabled = false,
  label,
  onChange,
  options,
  placeholder = 'Selecione',
  values,
}: AppMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedValues = useMemo(() => new Set(values), [values]);
  const selectedLabels = options
    .filter((option) => selectedValues.has(option.value))
    .map((option) => option.label);

  function toggleOption(value: string) {
    if (selectedValues.has(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }

    onChange([...values, value]);
  }

  return (
    <SelectWrapper>
      <SelectLabel>{label}</SelectLabel>
      <SelectButton
        $disabled={disabled}
        $hasValue={selectedLabels.length > 0}
        disabled={disabled}
        onPress={() => setIsOpen(true)}
      >
        <SelectButtonText $hasValue={selectedLabels.length > 0}>
          {selectedLabels.length ? `${selectedLabels.length} selecionada(s)` : placeholder}
        </SelectButtonText>
      </SelectButton>

      <Modal animationType="slide" transparent visible={isOpen} onRequestClose={() => setIsOpen(false)}>
        <ModalBackdrop onPress={() => setIsOpen(false)}>
          <ModalPanel>
            <ModalTitle>{label}</ModalTitle>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const active = selectedValues.has(option.value);

                return (
                  <OptionButton
                    key={option.value}
                    $active={active}
                    onPress={() => toggleOption(option.value)}
                  >
                    <OptionLabel $active={active}>{option.label}</OptionLabel>
                  </OptionButton>
                );
              })}
            </ScrollView>
            <AppButton label="Concluir" onPress={() => setIsOpen(false)} variant="secondary" />
          </ModalPanel>
        </ModalBackdrop>
      </Modal>
    </SelectWrapper>
  );
}
