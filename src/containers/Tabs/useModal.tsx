// Libs
import { useState, useCallback } from 'react';

export default () => {
  const [modals, setModals] = useState<{
    add: boolean;
    remove: string;
    lock: boolean;
    view?: string;
  }>({
    add: false,
    remove: '',
    lock: false,
    view: ''
  });

  const toggleModal = useCallback(
    (modal: 'add' | 'remove' | 'lock' | 'view') => (value?: string | boolean) => {
      setModals(modals => ({
        ...modals,
        [modal]: value ? value : !modals[modal]
      }));
    },
    [setModals]
  );

  return { modals, toggleModal };
};
