// Libs
import React, { MouseEvent, useState } from 'react';
import PropTypes from 'prop-types';
// Components
import ViewModal from '../../components/Modals/ViewIdentity';
import { useAccountData } from '../../context/accountData';
import { useRoleData } from '../../context/rolesData';

import { ModalDisplay } from '../../constants/modals';
import { BigNumber } from 'ethers/utils';

type Item = {
  id: string;
  itemId?: string;
  value: string;
};

const ViewModalContainer: React.FC<{
  isOpen: boolean;
  closeModal: () => void;
  handleAdd: (input: string | undefined, input2: any[]) => void;
  value?: string | boolean;
  display: ModalDisplay;
}> = ({ isOpen, closeModal, handleAdd, display, value }) => {
  const [input, setInput] = useState(['']);
  const [itemsList, setItems] = useState<Item[]>([]);

  //const [input3, setInput3] = useState(['']);
  const { allowlist } = useAccountData();
  const { rolelist } = useRoleData();
  const [validation, setValidation] = useState({ valid: false });

  const myType = allowlist.find(({ address }) => address == value);
  console.log('Identity.........', myType);
  //console.log('RoleLists.........', rolelist);
  /* const items = [
  { id: "1", value: "Video Client" },
  { id: "2", value: "Test" },

   ]; */
  var items = [];
  for (var i = 0; i < rolelist.length; i++) {
    items.push({ id: i + 1, itemId: rolelist[i].roleId, value: rolelist[i].roleName });
  }
  console.log('RoleLists.........', items);

  const handleChangeValue = (e: Item[]) => {
    setItems(e);
    console.log('EEEEEEEEEEEE', e);
  };

  const handleClose = (e: MouseEvent) => {
    e.preventDefault();
    closeModal();
  };

  const handleSubmit = (e: MouseEvent) => {
    var items3 = [];
    console.log('HANDLE ADD----------------------');

    for (var i = 0; i < itemsList.length; i++) {
      items3.push(itemsList[i].itemId);
    }

    handleAdd(myType?.address, items3);
  };

  return (
    <ViewModal
      identityName={myType?.address || ''}
      identityType={myType?.idType || ''}
      roles={myType?.roles || ['']}
      items={items || ['']}
      handleSubmit={handleSubmit}
      handleChangeValue={handleChangeValue}
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
