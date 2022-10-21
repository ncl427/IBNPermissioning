// Libs
import React, { MouseEvent, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { BigNumber, BigNumberish } from 'ethers/utils';
import { MultiSelect } from '../MultiSelect';

import {
  Dialog,
  Button,
  DialogTitle,
  TextField,
  DialogActions,
  DialogContent,
  DialogContentText,
  Typography,
  Divider,
  Container
} from '@material-ui/core';
// Styles
import styles from './styles.module.scss';
import { ModalDisplay } from '../../constants/modals';
//import { BigNumber } from 'ethers/utils';

type Item = {
  id: string;
  itemId?: string;
  value: string;
};

const ViewModal: React.FC<{
  identityName: string;
  identityType: string;
  roles: string[];
  items: any[];
  handleSubmit: (e: MouseEvent) => void;
  handleChangeValue: (e: Item[]) => void;
  isOpen: boolean;
  closeModal: (e: MouseEvent) => void;
  display: ModalDisplay;
}> = ({
  identityName,
  identityType,
  roles,
  //modifyInput3,
  items,
  handleSubmit,
  handleChangeValue,
  isOpen,
  closeModal,
  display
}) => {
  var selectedITems: any[] = [];

  for (var j = 0; j < roles.length; j++) {
    const selectedItem = items.find(item => item.itemId === roles[j]);
    if (selectedItem != undefined) {
      selectedITems.push(selectedItem);
    }
  }

  console.log('PEEEEEEEEEEEEEEEEEEEEEEEEE-------', selectedITems);

  return (
    <Dialog open={isOpen} onClose={closeModal} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{display.heading}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {display.subHeading}
          {display.label}
        </DialogContentText>
        <Container className={styles.bold}>
          <DialogContentText>{identityName}</DialogContentText>
        </Container>

        <DialogContentText>
          {display.subHeading}
          {display.label2}
        </DialogContentText>
        <Container className={styles.bold}>
          <DialogContentText>{identityType}</DialogContentText>
        </Container>
        <DialogContentText>
          {display.subHeading}
          {display.label3}
        </DialogContentText>
        <Container className={styles.bold}>
          <DialogContentText>0x28803646424f230242710320d53fe761589b467e2e0b8bd09f177bde6478d963</DialogContentText>
        </Container>
        <DialogContentText>
          {display.subHeading}
          {display.label4}
        </DialogContentText>
        <Container className={styles.bold}>
          <MultiSelect
            items={items}
            placeholder="Select a Role"
            selectedItemsThis={selectedITems}
            handleChangeValue={handleChangeValue}
          />
        </Container>

        <Typography gutterBottom></Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={closeModal}>Close</Button>
        <Button color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ViewModal.propTypes = {
  identityName: PropTypes.string.isRequired,
  identityType: PropTypes.string.isRequired,
  roles: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleChangeValue: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  display: PropTypes.any.isRequired
};

export default ViewModal;
