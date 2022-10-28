// Libs
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
// Components
import RolesTable from './Table';
import AddModal from '../../containers/Modals/AddRole';
import RemoveModal from '../../containers/Modals/Remove';
import ViewModal from '../../containers/Modals/ViewRole';
// Constants
import { addRoleDisplay, removeRoleDisplay, viewRolesDisplay } from '../../constants/modals';
//import { BigNumber } from 'ethers/utils';

type RolesTab = {
  list: any[];
  modals: {
    add: boolean;
    remove: boolean | string;
    lock: boolean;
    view?: boolean | string;
  };
  toggleModal: (name: 'add' | 'remove' | 'lock' | 'view') => (value?: boolean | string) => void;
  handleAdd: (value: string, value2: string /* , value3: string[] */) => Promise<void>;
  handleRemove: (value: any) => Promise<void>;
  isAdmin: boolean;
  deleteTransaction: (identifier: string) => void;
  isValidString: (value: string) => { valid: boolean };
  //isValidBigNumber: (value: BigNumber) => { valid: boolean; };
  isValidArray: (value: string[]) => { valid: boolean };
  isOpen: boolean;
  isReadOnly: boolean;
};

const RolesTab: React.FC<RolesTab> = ({
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
        <RolesTable
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
          display={addRoleDisplay}
          isValidString={isValidString}
          isValidArray={isValidArray}
        />
        <RemoveModal
          isOpen={Boolean(modals.remove) && isAdmin}
          value={modals.remove}
          closeModal={() => toggleModal('remove')(false)}
          handleRemove={handleRemove}
          display={removeRoleDisplay(modals.remove)}
        />
        <ViewModal
          isOpen={Boolean(modals.view) && isAdmin}
          value={modals.view}
          closeModal={() => toggleModal('view')(false)}
          display={viewRolesDisplay(modals.view || '')}
        />
      </Fragment>
    )}
  </Fragment>
);

RolesTab.propTypes = {
  list: PropTypes.array.isRequired,
  modals: PropTypes.shape({
    add: PropTypes.bool.isRequired,
    remove: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
    lock: PropTypes.bool.isRequired,
    view: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired
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

export default RolesTab;
