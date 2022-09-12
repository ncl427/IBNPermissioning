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

  event PolicyAdded(bool policyAdded, uint256 policyId);

  event PolicyUpdated(bool policyUpdated, uint256 policyId);

  event PolicyRemoved(bool policyRemoved, uint256 policyId);

  event RoleAdded(bool roleAdded, uint256 roleId);

  event RoleUpdated(bool roleUpdated, uint256 roleId);

  event RoleRemoved(bool roleRemoved, uint256 roleId);

  event ServiceAdded(bool serviceAdded, uint256 serviceId);

  event ServiceUpdated(bool serviceUpdated, uint256 serviceId);

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

  function addRole(
    string memory roleName,
    string memory roleType,
    string[] memory roleAttributes
  ) external onlyAdmin onlyOnEditMode returns (bool) {
    uint256 roleId = policyStorage.addRole(roleName, roleType, roleAttributes);
    emit RoleAdded(true, roleId);
    return true;
  }

  function addPolicy(
    uint256[] memory policyRoles,
    uint256 policyService,
    address policyProvider,
    string memory hashedInfo
  ) external onlyAdmin onlyOnEditMode returns (bool) {
    uint256 policyId = policyStorage.addPolicy(policyRoles, policyService, policyProvider, hashedInfo);
    emit RoleAdded(true, policyId);
    return true;
  }

  function addService(
    string memory serviceName,
    string memory desc,
    string[] memory serviceConfig
  ) external onlyAdmin onlyOnEditMode returns (bool) {
    uint256 serviceId = policyStorage.addService(serviceName, desc, serviceConfig);
    emit RoleAdded(true, serviceId);
    return true;
  }

  function removePolicy(uint256 policyId) external onlyAdmin onlyOnEditMode returns (bool) {
    bool removed = policyStorage.removePolicy(policyId);
    emit RoleRemoved(removed, policyId);
  }

  function removeRole(uint256 roleId) external onlyAdmin onlyOnEditMode returns (bool) {
    bool removed = policyStorage.removeRole(roleId);
    emit RoleRemoved(removed, roleId);
  }

  function removeService(uint256 serviceId) external onlyAdmin onlyOnEditMode returns (bool) {
    bool removed = policyStorage.removeService(serviceId);
    emit RoleRemoved(removed, serviceId);
  }

  function policiesSize() external view returns (uint256) {
    return policyStorage.policiesSize();
  }

  function rolesSize() external view returns (uint256) {
    return policyStorage.rolesSize();
  }

  function servicesSize() external view returns (uint256) {
    return policyStorage.servicesSize();
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
