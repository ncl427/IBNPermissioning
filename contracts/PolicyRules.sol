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

import './PolicyRulesList.sol';
import './PolicyIngress.sol';
import './Admin.sol';
import './PolicyStorage.sol';

contract PolicyRules is PolicyRulesList {
  // in read-only mode rules can't be added/removed
  // this will be used to protect data when upgrading contracts
  bool private readOnlyMode = false;
  // version of this contract: semver like 1.2.14 represented like 001002014
  uint256 private version = 3000000;

  PolicyIngress private ingressContract;
  PolicyStorage private policyStorage;

  event PolicyAdded(
    bool policyAdded,
    uint256 policyId,
    uint256[] policyRoles,
    uint256 policyService,
    address policyProvider,
    string hashedInfo
  );

  event PolicyUpdated(
    bool policyUpdated,
    uint256 policyId,
    uint256[] policyRoles,
    uint256 policyService,
    address policyProvider,
    string hashedInf
  );

  event PolicyRemoved(bool policyRemoved, uint256 policyId);

  event RoleAdded(bool roleAdded, uint256 roleId, string roleName, uint256 roleType, string[] roleAttributes);

  event RoleUpdated(bool roleUpdated, uint256 roleId, string roleName, string roleType, string[] roleAttributes);

  event RoleRemoved(bool roleRemoved, uint256 roleId);

  event ServiceAdded(bool serviceAdded, uint256 serviceId, string serviceName, string desc, string[] serviceConfig);

  event ServiceUpdated(bool serviceUpdated, uint256 serviceId, string serviceName, string desc, string[] serviceConfig);

  event ServiceRemoved(bool serviceRemoved, uint256 serviceId);

  modifier onlyOnEditMode() {
    require(!readOnlyMode, 'In read only mode: rules cannot be modified');
    _;
  }

  modifier onlyAdmin() {
    require(isAuthorizedAdmin(msg.sender), 'Sender not authorized');
    _;
  }

  constructor(PolicyIngress _ingressContract, PolicyStorage _storage) {
    setStorage(_storage);
    policyStorage = _storage;
    ingressContract = _ingressContract;
  }

  // VERSION
  function getContractVersion() external view returns (uint256) {
    return version;
  }

  // READ ONLY MODE
  function isReadOnly() external view returns (bool) {
    return readOnlyMode;
  }

  function enterReadOnly() external onlyAdmin returns (bool) {
    require(readOnlyMode == false, 'Already in read only mode');
    readOnlyMode = true;
    return true;
  }

  function exitReadOnly() external onlyAdmin returns (bool) {
    require(readOnlyMode == true, 'Not in read only mode');
    readOnlyMode = false;
    return true;
  }

  function addRoleType(string memory roleTypeName, string memory roleAttributes)
    external
    onlyAdmin
    onlyOnEditMode
    returns (bool)
  {
    policyStorage.addRoleType(roleTypeName, roleAttributes);
    return true;
  }

  function addRole(
    string memory roleName,
    uint256 roleType,
    string[] memory roleAttributes
  ) external onlyAdmin onlyOnEditMode returns (bool) {
    require(roleTypeExists(roleType), 'RoleType does not exist');
    uint256 roleId = policyStorage.addRole(roleName, roleType, roleAttributes);
    emit RoleAdded(true, roleId, roleName, roleType, roleAttributes);
    return true;
  }

  function addPolicy(
    uint256[] memory policyRoles,
    uint256 policyService,
    address policyProvider,
    string memory hashedInfo
  ) external onlyAdmin onlyOnEditMode returns (bool) {
    for (uint256 i = 0; i < policyRoles.length; i++) {
      require(roleExists(policyRoles[i]), 'Role does not exist');
    }
    require(serviceExists(policyService), 'Service does not exist');
    uint256 policyId = policyStorage.addPolicy(policyRoles, policyService, policyProvider, hashedInfo);
    emit PolicyAdded(true, policyId, policyRoles, policyService, policyProvider, hashedInfo);
    return true;
  }

  function addService(
    string memory serviceName,
    string memory desc,
    string[] memory serviceConfig
  ) external onlyAdmin onlyOnEditMode returns (bool) {
    uint256 serviceId = policyStorage.addService(serviceName, desc, serviceConfig);
    emit ServiceAdded(true, serviceId, serviceName, desc, serviceConfig);
    return true;
  }

  function removePolicy(uint256 policyId) external onlyAdmin onlyOnEditMode returns (bool) {
    require(policyExists(policyId), 'Policy does not exist');
    bool removed = policyStorage.removePolicy(policyId);
    emit PolicyRemoved(removed, policyId);
    return removed;
  }

  function removeRole(uint256 roleId) external onlyAdmin onlyOnEditMode returns (bool) {
    require(roleExists(roleId), 'Role does not exist');

    bool removed = policyStorage.removeRole(roleId);
    emit RoleRemoved(removed, roleId);
    return removed;
  }

  function removeService(uint256 serviceId) external onlyAdmin onlyOnEditMode returns (bool) {
    require(serviceExists(serviceId), 'Service does not exist');

    bool removed = policyStorage.removeService(serviceId);
    emit ServiceRemoved(removed, serviceId);
    return removed;
  }

  function policiesSize() external view returns (uint256) {
    return policyStorage.policiesSize();
  }

  function rolesSize() external view returns (uint256) {
    return policyStorage.rolesSize();
  }

  function roleTypesSize() external view returns (uint256) {
    return policyStorage.roleTypesSize();
  }

  function servicesSize() external view returns (uint256) {
    return policyStorage.servicesSize();
  }

  // The following function is for getting all the policies
  function getAllPolicies() public view returns (Policies[] memory) {
    uint256 itemCount = policyStorage.policiesSize();
    
    Policies[] memory items = new Policies[](itemCount);
    for (uint256 i = 0; i < itemCount; i++) {
      // I keep track of the policies in a mapping
      // It is saving the tokens of user in order
      uint256 policyId = policyStorage.getPolicyByIndex(i);
      (uint256[] memory policyRoles, uint256 policyService, address policyProvider, string memory hashedInfo) = policyStorage.getFullPolicyById(policyId);
      Policies memory item = Policies({policyId: policyId,
            policyRoles: policyRoles,
            policyService: policyService,
            policyProvider: policyProvider,
            hashedInfo: hashedInfo
            });
      items[i] = item;
    }
    return items;
  }

  //** ADDED this function for modifying permissioned account information */
  /*   function updateAccount(
    address account,
    string memory hashedInfo,
    bool enrolled,
    string memory idType
  ) external onlyAdmin onlyOnEditMode returns (bool) {
    bool updated = updateIdentityInfo(account, hashedInfo, enrolled, idType);
    emit AccountUpdated(updated, account);
    return updated;
  } */

  function isAuthorizedAdmin(address user) private view returns (bool) {
    address adminContractAddress = ingressContract.getContractAddress(ingressContract.ADMIN_CONTRACT());

    require(adminContractAddress != address(0), 'Ingress contract must have Admin contract registered');
    return Admin(adminContractAddress).isAuthorized(user);
  }
}
