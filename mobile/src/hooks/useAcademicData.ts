import { useContext } from 'react';

import { AcademicDataContext } from '../context/AcademicDataContext';

export function useAcademicData() {
  const context = useContext(AcademicDataContext);

  if (!context) {
    throw new Error(
      'useAcademicData deve ser utilizado dentro de AcademicDataProvider.'
    );
  }

  return context;
}
