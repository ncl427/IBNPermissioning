// Libs
import React, { MouseEvent, useState } from 'react';
import PropTypes from 'prop-types';
// Components
import AddModal from '../../components/Modals/AddPolicy';
import { ModalDisplay } from '../../constants/modals';
//import { BigNumber } from 'ethers/utils';

const AddModalContainer: React.FC<{
  isOpen: boolean;
  closeModal: () => void;
  handleAdd: (input: string[], input2: string, input3: string) => void;
  isValidString: (value: string) => { valid: boolean; msg?: string };
  //isValidBigNumber: (value: BigNumber) => { valid: boolean; msg?: BigNumber };
  isValidArray: (value: string[]) => { valid: boolean; msg?: string[] };
  display: ModalDisplay;
}> = ({ isOpen, closeModal, handleAdd, isValidString, isValidArray, display }) => {
  const [input3, setInput3] = useState('');
  const [input2, setInput2] = useState('');
  const [input, setInput] = useState(['']);
  const [validation, setValidation] = useState({ valid: false });

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
    handleAdd(input, input2, input3);
  };

  const handleClose = (e: MouseEvent) => {
    e.preventDefault();
    setInput3('');
    setInput2('');
    setInput(['']);
    setValidation({ valid: false });
    closeModal();
  };

  return (
    <AddModal
      input={input[0]}
      input2={input2.toString()}
      input3={input3}
      validationResult={validation}
      modifyInput={modifyInput}
      modifyInput2={modifyInput2}
      modifyInput3={modifyInput3}
      handleSubmit={handleSubmit}
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
