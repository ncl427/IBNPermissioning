import React, { useEffect, useRef, useState, MouseEvent } from 'react';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faTimes } from '@fortawesome/free-solid-svg-icons';

const Wrapper = styled.div<{ raised?: boolean }>`
  width: 200px;
  height: auto;
  display: flex;
  zIndex: '1'
  box-shadow: ${props => (props.raised ? '6px 5px 22px -8px rgba(0,0,0,0.76)' : 'none')};
  padding: 10px;
  border-radius: 6px;
  justify-content: space-between;
  align-items: center;
  position: relative;
  &:hover {
    cursor: pointer;
  }
`;

export type Item = {
  id: string;
  itemId?: string;
  value: string;
};

type MultiSelectProps = {
  raised?: boolean;
  items: Item[];
  selectedItemsThis: any[];
  placeholder: string;
  handleChangeValue: (e: Item[]) => void;
};

const SelectedItemsContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-wrap: wrap;
`;

const SelectIcon = styled.span`
  display: 'inline-block';
  width: 20px;
`;

const DropDown = styled.ul<{
  opened: boolean;
  raised?: boolean;
  wrapperClientHeight: number;
}>`
  position: absolute;
  top: ${({ wrapperClientHeight }) => wrapperClientHeight - 10}px;
  left: 0px;
  height: 'inherit';

  opacity: ${({ opened }) => (opened ? 1 : 0)};
  visibility: ${({ opened }) => (opened ? 'visible' : 'hidden')};
  width: inherit;
  box-shadow: ${props => (props.raised ? '6px 5px 22px -8px rgba(0,0,0,0.76)' : 'none')};
  border-radius: 6px;
  padding: 6px;
  transition: all 0.2s linear 0.1s;
  & > li {
    list-style: none;
    padding: 8px;

    &:hover {
      background-color: papayawhip;
    }
  }
`;

const Chip = styled.span`
  background: #e8f7f6;
  padding: 6px;
  border-radius: 4px;
  margin: 4px;
  & > span {
    margin-right: 8px;
  }
`;

export const MultiSelect: React.FC<MultiSelectProps> = ({
  raised = true,
  items,
  selectedItemsThis,
  placeholder = 'Select an Item',
  handleChangeValue
}) => {
  const [selectedItems, setSelectedItems] = useState<Item[]>(selectedItemsThis);
  const [opened, setIsOpened] = useState(false);
  const wrapperRef = useRef<any>(null);
  const [wrapperClientHeight, setWrapperClientHeight] = useState(40);

  console.log('MultiSelect Items', items);

  const onClickWrapper = () => {
    setIsOpened(!opened);
  };

  const onClickDeleteItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
    handleChangeValue(selectedItems);
  };

  useEffect(() => {
    if (wrapperRef && wrapperRef.current) {
      if (selectedItems.length > 0) {
        const newwrapperClientHeight = wrapperRef && wrapperRef.current ? wrapperRef.current.clientHeight : 25;

        setWrapperClientHeight(newwrapperClientHeight);
      } else {
        setWrapperClientHeight(40);
      }
    }
  }, [selectedItems]);

  useEffect(() => {
    if (selectedItems.length === items.length) {
      setIsOpened(false);
    }
  }, [selectedItems, items]);

  const onDropDownClicked = (newItem: Item) => {
    console.log('on dropdown clicked called');
    setSelectedItems([...selectedItems, newItem]);
  };

  useEffect(() => {
    //console.log('WOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOW', selectedItems);
    handleChangeValue(selectedItems);
  }, [selectedItems]);

  console.log('selctedItems--', wrapperRef && wrapperRef.current && wrapperRef.current.clientHeight);

  console.log(items.filter(item => selectedItems.findIndex(sel => sel.id === item.id) === -1));
  const filteredItems = items.filter(item => selectedItems.findIndex(sel => sel.id === item.id) === -1);
  return (
    <Wrapper raised={raised} onClick={onClickWrapper} ref={wrapperRef}>
      <SelectedItemsContainer>
        {selectedItems.length === 0 && <span>{placeholder} </span>}
        {selectedItems.map(({ id, itemId, value }) => (
          <Chip key={id} onClick={e => e.stopPropagation()}>
            {' '}
            <span>{value}</span>
            <span
              onClick={e => {
                e.stopPropagation();
                onClickDeleteItem(id);
              }}
            >
              <FontAwesomeIcon icon={faTimes} fontSize="10px" color="gray" />
            </span>
          </Chip>
        ))}
      </SelectedItemsContainer>
      <SelectIcon>
        <FontAwesomeIcon icon={opened ? faArrowUp : faArrowDown} fontSize="12px" />
      </SelectIcon>
      {filteredItems.length > 0 && (
        <DropDown opened={opened} raised={raised} wrapperClientHeight={wrapperClientHeight}>
          {filteredItems.map(({ id, itemId, value }) => (
            <li
              key={id}
              onClick={e => {
                e.stopPropagation();
                onDropDownClicked({ id, itemId, value });
              }}
            >
              {' '}
              {value}
            </li>
          ))}
        </DropDown>
      )}
    </Wrapper>
  );
};
