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

import './PolicyStorage.sol';

contract PolicyRulesList {
  //** Added Struct for keeping extra information of the Policy information (Roles, Services) */
  struct Roles {
    uint256 roleId;
    string roleName;
    string roleType;
    string[] roleAttributes;
  }

  struct Services {
    uint256 serviceId;
    string serviceName;
    string description;
    string[] serviceConfig;
  }

  struct Policies {
    uint256 policyId;
    uint256[] policyRoles;
    uint256 policyService;
    address policyProvider;
    string hashedInfo;
  }


  PolicyStorage private policyStorage;

  function setStorage(PolicyStorage _storage) internal {
    policyStorage = _storage;
  }

  function upgradeVersion(address _newVersion) internal {
    policyStorage.upgradeVersion(_newVersion);
  }

  function policyExists(uint256 _policyId) public view returns (bool) {
    return policyStorage.policyExists(_policyId);
  }

  function roleExists(uint256 _roleId) public view returns (bool) {
    return policyStorage.roleExists(_roleId);
  }

  function serviceExists(uint256 _serviceId) public view returns (bool) {
    return policyStorage.serviceExists(_serviceId);
  }


  //** ADDED this function for modifying permissioned account information */
  /*    function updateIdentityInfo(address _account, string memory hashedInfo, bool enrolled, string memory idType )  internal returns (bool) {
        return policyStorage.updateIdentityInfo(_account, hashedInfo, enrolled, idType);
    } */

  function getRoleByIndex(uint256 index) public view returns (uint256 roleId) {
    return policyStorage.getRoleByIndex(index);
  }

  function getServiceByIndex(uint256 index) public view returns (uint256 serviceId) {
    return policyStorage.getServiceByIndex(index);
  }

  function getPolicyByIndex(uint256 index) public view returns (uint256 policyId) {
    return policyStorage.getPolicyByIndex(index);
  }

  //** ADDED this function for getting the information associated to an address */
  function getFullPolicyById(uint256 policyId)
    public
    view
    returns (
      uint256[] memory policyRoles,
      uint256 policyService,
      address policyProvider,
      string memory hashedInfo
    )
  {
    return policyStorage.getFullPolicyById(policyId);
  }

  function getFullRoleById(uint256 roleId)
    public
    view
    returns (
      string memory roleName,
      string memory roleType,
      string[] memory roleAttributes
    )
  {
    return policyStorage.getFullRoleById(roleId);
  }

  function getFullServiceById(uint256 serviceId)
    public
    view
    returns (
      string memory serviceName,
      string memory description,
      string[] memory serviceConfig
    )
  {
    return policyStorage.getFullServiceById(serviceId);
  }

  function getPolicies() public view returns (uint256[] memory) {
    return policyStorage.getPolicies();
  }

  function getRoles() public view returns (uint256[] memory) {
    return policyStorage.getPolicies();
  }

  function getServices() public view returns (uint256[] memory) {
    return policyStorage.getPolicies();
  }
}
