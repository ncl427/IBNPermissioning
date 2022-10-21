// Libs
import React, { MouseEvent, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// Components
import AddModal from '../../components/Modals/AddPolicy';
import { ModalDisplay } from '../../constants/modals';
import { useRoleData } from '../../context/rolesData';
import { useServiceData } from '../../context/serviceData';
import { useAccountData } from '../../context/accountData';

//import { BigNumber } from 'ethers/utils';

type Item = {
  id: string;
  itemId?: string;
  value: string;
};

const AddModalContainer: React.FC<{
  isOpen: boolean;
  closeModal: () => void;
  handleAdd: (input: any[], input2: string, input3: string) => void;
  isValidString: (value: string) => { valid: boolean; msg?: string };
  //isValidBigNumber: (value: BigNumber) => { valid: boolean; msg?: BigNumber };
  isValidArray: (value: string[]) => { valid: boolean; msg?: string[] };
  display: ModalDisplay;
}> = ({ isOpen, closeModal, handleAdd, isValidString, isValidArray, display }) => {
  const [input3, setInput3] = useState('');
  const [input2, setInput2] = useState('');
  const [input, setInput] = useState(['']);
  const [itemsList, setItems] = useState<Item[]>([]);

  const [validation, setValidation] = useState({ valid: false });

  const { rolelist } = useRoleData();
  const { servicelist } = useServiceData();
  const { allowlist } = useAccountData();

  var items = [];
  for (var i = 0; i < rolelist.length; i++) {
    items.push({ id: i + 1, itemId: rolelist[i].roleId, value: rolelist[i].roleName });
  }

  var serviceItems = [];
  for (var i = 0; i < servicelist.length; i++) {
    serviceItems.push({ id: servicelist[i].serviceId, label: servicelist[i].serviceName });
  }

  var identityItems = [];
  for (var i = 0; i < allowlist.length; i++) {
    identityItems.push({ id: allowlist[i].identifier, label: allowlist[i].address });
  }

  const [selectInput, setValue] = useState<any | null>([]);
  const [selectInput2, setValue2] = useState<any | null>([]);

  const handleChange = (event: any, newValue: string | null) => {
    setValue(newValue);
  };

  const handleChangeProvider = (event: any, newValue: string | null) => {
    setValue2(newValue);
  };

  const handleChangeValue = (e: Item[]) => {
    setItems(e);
    console.log('EEEEEEEEEEEE', e);
  };

  const modifyInput3 = ({ target: { value } }: { target: { value: string } }) => {
    const validation = isValidString(value);
    setInput3(value);
    setValidation(validation);
  };

  const modifyInput2 = ({ target: { value } }: { target: { value: string } }) => {
    const validation = isValidString(value);
    setInput2(value);
    setValidation(validation);
  };

  const modifyInput = ({ target: { value } }: { target: { value: string } }) => {
    input[0] = value;
    const validation = isValidArray(input);
    setInput(input);
    setValidation(validation);
  };

  const handleSubmit = (e: MouseEvent) => {
    e.preventDefault();
    setInput3('');
    setInput2('');
    setInput(['']);
    setValidation({ valid: false });

    var items3 = [];
    console.log('HANDLE ADD----------------------');

    for (var i = 0; i < itemsList.length; i++) {
      items3.push(itemsList[i].itemId);
    }
    handleAdd(items3, selectInput.id, selectInput2.label);
  };

  const handleClose = (e: MouseEvent) => {
    e.preventDefault();
    setInput3('');
    setInput2('');
    setInput(['']);
    setValidation({ valid: false });
    closeModal();
  };

  useEffect(() => {
    if (selectInput != null && selectInput2 != null && itemsList.length > 0) {
      setValidation({ valid: true });
    } else {
      setValidation({ valid: false });
    }
  }, [selectInput, selectInput2, itemsList]);

  return (
    <AddModal
      input={input[0]}
      input2={input2.toString()}
      input3={input3}
      items={items || ['']}
      serviceItems={serviceItems || ['']}
      identityItems={identityItems || ['']}
      handleChangeValue={handleChangeValue}
      validationResult={validation}
      modifyInput={modifyInput}
      modifyInput2={modifyInput2}
      modifyInput3={modifyInput3}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      handleChangeProvider={handleChangeProvider}
      isOpen={isOpen}
      closeModal={handleClose}
      display={display}
    />
  );
};

AddModalContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleAdd: PropTypes.func.isRequired,
  isValidString: PropTypes.func.isRequired,
  isValidArray: PropTypes.func.isRequired,
  display: PropTypes.any.isRequired
};

export default AddModalContainer;
