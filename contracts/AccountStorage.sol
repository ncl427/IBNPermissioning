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

import "./Admin.sol";
import "./AccountIngress.sol";


contract AccountStorage {
    event VersionChange(
        address oldAddress,
        address newAddress
    );
    // initialize this to the deployer of this contract
    address private latestVersion = msg.sender;
    address private owner = msg.sender;

    AccountIngress private ingressContract;


     //** Added Struct for keeping extra information of the identities */ 
    struct identity {
        string hashedInfo;
        bool enrolled;
        string idType;
        uint[] roles;
    }

    address[] public allowlist;
    mapping (address => identity) public permInfo; //Holds the information of the permissioned address
    mapping (address => uint256) private indexOf; //1 based indexing. 0 means non-existent

constructor (AccountIngress _ingressContract) {
        ingressContract = _ingressContract;
        add(msg.sender);
    }

    modifier onlyLatestVersion() {
        require(msg.sender == latestVersion, "only the latestVersion can modify the list");
        _;
    }

    modifier onlyAdmin() {
        if (address(0) == address(ingressContract)) {
            require(msg.sender == owner, "only owner permitted since ingressContract is explicitly set to zero");
        } else {
            address adminContractAddress = ingressContract.getContractAddress(ingressContract.ADMIN_CONTRACT());

            require(adminContractAddress != address(0), "Ingress contract must have Admin contract registered");
            require(Admin(adminContractAddress).isAuthorized(msg.sender), "Sender not authorized");
        }
        _;
    }

    function upgradeVersion(address _newVersion) public onlyAdmin {
        emit VersionChange(latestVersion, _newVersion);
        latestVersion = _newVersion;
    }

    function size() public view returns (uint256) {
        return allowlist.length;
    }

    function exists(address _account) public view returns (bool) {
        return indexOf[_account] != 0;
    }

    //** MODIFIED this function for adding extra account info */
    function add(address _account) public onlyLatestVersion returns (bool) {
        if (indexOf[_account] == 0) {

            identity memory newIdentity = identity({
            hashedInfo: 'None',
            enrolled: false,
            idType: 'undefined',
            roles: new uint[](0)
            });
            allowlist.push(_account);
            indexOf[_account] = allowlist.length;
            permInfo[_account] = newIdentity;
            return true;
        }
        return false;
    }

    //** MODIFIED this function for deleting extra account info */
    function remove(address _account) public onlyLatestVersion returns (bool) {
        uint256 index = indexOf[_account];
        if (index > 0 && index <= allowlist.length) { //1-based indexing
            //move last address into index being vacated (unless we are dealing with last index)
            if (index != allowlist.length) {
                address lastAccount = allowlist[allowlist.length - 1];
                allowlist[index - 1] = lastAccount;
                indexOf[lastAccount] = index;
            }

            //shrink array
            allowlist.pop();
            indexOf[_account] = 0;
            delete permInfo[_account];
            return true;
        }
        return false;
    }
    //** ADDED this function for modifying permissioned account information */
    function updateIdentityInfo(address _account, string memory hashedInfo, bool enrolled, string memory idType ) public onlyLatestVersion returns (bool) {
        string memory empty = "";
        uint256 index = indexOf[_account];
        if (index > 0) {
            if (keccak256(bytes(hashedInfo)) == keccak256(bytes(empty))) {
                updateIdentityEnroll(_account, enrolled);
                return true;
            } 
             else
            {
                updateIdentity(_account, hashedInfo, idType);
                return true;
            }

        }
        return false;

    }
    //**Update function helper */
    function updateIdentityEnroll(address _account, bool enrolled ) private  {
        identity storage updateId = permInfo[_account];
        updateId.enrolled = enrolled;
    }
    //**Update function helper */
    function updateIdentity(address _account, string memory hashedInfo, string memory idType ) private {
        identity storage updateId = permInfo[_account];
        updateId.hashedInfo = hashedInfo;
        updateId.enrolled = true;
        updateId.idType = idType;
    }

    //**Add Role to Identity Function */
    function addRoleToIdentity(address _account, uint256[] memory roles) public onlyLatestVersion returns (bool)  {
        identity storage updateId = permInfo[_account];
        updateId.roles = roles;

        return true;
    }


    


    function getByIndex(uint index) public view returns (address account) {
        return allowlist[index];
    }

    //** ADDED this function for getting the information associated to an address */
    function getFullByAddress(address account) public view returns (string memory hashedInfo, bool enrolled, string memory idType, uint256[] memory roles  ) {
        return (permInfo[account].hashedInfo, permInfo[account].enrolled, permInfo[account].idType, permInfo[account].roles);
    }

    function getAccounts() public view returns (address[] memory){
        return allowlist;
    }
}
