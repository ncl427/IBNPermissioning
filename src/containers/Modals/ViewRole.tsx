// Libs
import React, { MouseEvent, useState } from 'react';
import PropTypes from 'prop-types';
// Components
import ViewModal from '../../components/Modals/ViewRole';
import { useRoleData } from '../../context/rolesData';

import { ModalDisplay } from '../../constants/modals';
//import { BigNumber } from 'ethers/utils';

const ViewModalContainer: React.FC<{
  isOpen: boolean;
  closeModal: () => void;
  value?: string | boolean;
  display: ModalDisplay;
}> = ({ isOpen, closeModal, display, value }) => {
  const [input, setInput] = useState('');
  const [input2, setInput2] = useState('');
  //const [input3, setInput3] = useState(['']);
  const { allowlist } = useRoleData();
  const [validation, setValidation] = useState({ valid: false });

  const myType = allowlist.find(({ roleId }) => roleId == value);
  console.log('ROLE.........', myType);

  const handleClose = (e: MouseEvent) => {
    e.preventDefault();
    closeModal();
  };

  return (
    <ViewModal
      roleName={myType?.roleName || ''}
      roleType={myType?.roleType || ''}
      roleAttributes={myType?.roleAttributes || ['']}
      isOpen={isOpen}
      closeModal={handleClose}
      display={display}
    />
  );
};

ViewModalContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  display: PropTypes.any.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired
};

export default ViewModalContainer;
