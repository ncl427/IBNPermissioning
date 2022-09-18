// Libs
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
// Components
import PolicyTable from './Table';
import AddModal from '../../containers/Modals/AddPolicy';
import RemoveModal from '../../containers/Modals/Remove';
// Constants
import { addPolicyDisplay, removePolicyDisplay } from '../../constants/modals';
//import { BigNumber } from 'ethers/utils';

type PolicyTab = {
  list: any[];
  modals: {
    add: boolean;
    remove: boolean | string;
    lock: boolean;
  };
  toggleModal: (name: 'add' | 'remove' | 'lock') => (value?: boolean | string) => void;
  handleAdd: (value: string[], value2: string, value3: string) => Promise<void>;
  handleRemove: (value: any) => Promise<void>;
  isAdmin: boolean;
  deleteTransaction: (identifier: string) => void;
  isValidString: (value: string) => { valid: boolean };
  //isValidBigNumber: (value: BigNumber) => { valid: boolean; };
  isValidArray: (value: string[]) => { valid: boolean };
  isOpen: boolean;
  isReadOnly: boolean;
};

const PolicyTab: React.FC<PolicyTab> = ({
  list,
  modals,
  toggleModal,
  handleAdd,
  handleRemove,
  isAdmin,
  deleteTransaction,
  isValidString,
  //isValidBigNumber,
  isValidArray,
  isOpen,
  isReadOnly
}) => (
  <Fragment>
    {isOpen && (
      <Fragment>
        <PolicyTable
          list={list}
          toggleModal={toggleModal}
          isAdmin={isAdmin}
          deleteTransaction={deleteTransaction}
          isReadOnly={isReadOnly}
        />
        <AddModal
          isOpen={Boolean(modals.add) && isAdmin}
          closeModal={() => toggleModal('add')(false)}
          handleAdd={handleAdd}
          display={addPolicyDisplay}
          isValidString={isValidString}
          isValidArray={isValidArray}
        />
        <RemoveModal
          isOpen={Boolean(modals.remove) && isAdmin}
          value={modals.remove}
          closeModal={() => toggleModal('remove')(false)}
          handleRemove={handleRemove}
          display={removePolicyDisplay(modals.remove)}
        />
      </Fragment>
    )}
  </Fragment>
);

PolicyTab.propTypes = {
  list: PropTypes.array.isRequired,
  modals: PropTypes.shape({
    add: PropTypes.bool.isRequired,
    remove: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
    lock: PropTypes.bool.isRequired
  }).isRequired,
  toggleModal: PropTypes.func.isRequired,
  handleAdd: PropTypes.func.isRequired,
  handleRemove: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  deleteTransaction: PropTypes.func.isRequired,
  isValidString: PropTypes.func.isRequired,
  isValidArray: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool.isRequired
};

export default PolicyTab;
