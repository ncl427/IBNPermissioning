/*
 * Copyright ConsenSys AG.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
pragma solidity >=0.6.0 <0.9.0;

import "./AccountStorage.sol";


contract AccountRulesList {

    //** Added Struct for keeping extra information of the accounts */ 
    struct identity {
        string hashedInfo;
        bool enrolled;
    }
    
    event AccountAdded(
        bool accountAdded,
        address accountAddress
    );

    event AccountUpdated(
        bool accountUpdated,
        address accountAddress
    );

    event AccountRemoved(
        bool accountRemoved,
        address accountAddress
    );

    AccountStorage private accountStorage;

    function setStorage(AccountStorage _storage) internal {
        accountStorage = _storage;
    }

    function upgradeVersion(address _newVersion) internal {
        accountStorage.upgradeVersion(_newVersion);
    }

    function size() internal view returns (uint256) {
        return accountStorage.size();
    }

    function exists(address _account) internal view returns (bool) {
        return accountStorage.exists(_account);
    }

    function add(address _account) internal returns (bool) {
        return accountStorage.add(_account);
    }

    function addAll(address[] memory accounts) internal returns (bool) {
        bool allAdded = true;
        for (uint i = 0; i < accounts.length; i++) {
            bool added = add(accounts[i]);
            emit AccountAdded(added, accounts[i]);
            allAdded = allAdded && added;
        }

        return allAdded;
    }

    //** ADDED this function for modifying permissioned account information */
    function updateIdentityInfo(address _account, string memory hashedInfo, bool enrolled )  internal returns (bool) {
        return accountStorage.updateIdentityInfo(_account, hashedInfo, enrolled);
    }

    function remove(address _account) internal returns (bool) {
        return accountStorage.remove(_account);
    }

    function getByIndex(uint index) public view returns (address account) {
        return accountStorage.getByIndex(index);
    }


    //** ADDED this function for getting the information associated to an address */
    function getFullByAddress(address account) public view returns (string memory hashedInfo, bool enrolled  ) {
        return accountStorage.getFullByAddress(account);
    }


    function getAccounts() public view returns (address[] memory){
        return accountStorage.getAccounts();
    }
}
