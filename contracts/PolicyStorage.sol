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

import './Admin.sol';
import './PolicyIngress.sol';

contract PolicyStorage {
  event VersionChange(address oldAddress, address newAddress);
  // initialize this to the deployer of this contract
  address private latestVersion = msg.sender;
  address private owner = msg.sender;

  uint256 public rolesCount;
  uint256 public servicesCount;
  uint256 public policyCount;
  uint256 public roleTypesCount;

  PolicyIngress private ingressContract;

  //** Added Struct for keeping extra information of the Policy information (Roles, Services) */

  struct RoleTypes {
    string roleTypeName;
    string roleTypeAttributes; //Encoded JSON
  }

  struct Roles {
    uint256 roleId;
    string roleName;
    uint256 roleType;
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

  // May use in another version
  /*  enum roleTypes {
    Admin,
    Subscriber,
    OneTime
  } */

  uint256[] public policylist;
  uint256[] public rolelist;
  uint256[] public servicelist;
  uint256[] public roleTypelist;

  mapping(uint256 => uint256) private indexOfPolicy; //1 based indexing. 0 means non-existent
  mapping(uint256 => uint256) private indexOfRoles; //1 based indexing. 0 means non-existent
  mapping(uint256 => uint256) private indexOfServices; //1 based indexing. 0 means non-existent
  mapping(uint256 => uint256) private indexOfRoleTypes; //1 based indexing. 0 means non-existent

  //Mapping for Service Providers
  mapping(address => Services) public providedService;
  //Mapping of roleIds to RoleTypes
  mapping(uint256 => RoleTypes) public roleToTypes;

  //The official record of all roles ever created
  mapping(uint256 => Roles) public roles;
  //The official record of all services ever created
  mapping(uint256 => Services) public services;
  //The official record of all policies ever created
  mapping(uint256 => Policies) public policies;
  //The official record of all RoleTypes ever created
  mapping(uint256 => RoleTypes) public roleTypes;

  constructor(PolicyIngress _ingressContract) {
    ingressContract = _ingressContract;
  }

  modifier onlyLatestVersion() {
    require(msg.sender == latestVersion, 'only the latestVersion can modify the list');
    _;
  }

  modifier onlyAdmin() {
    if (address(0) == address(ingressContract)) {
      require(msg.sender == owner, 'only owner permitted since ingressContract is explicitly set to zero');
    } else {
      address adminContractAddress = ingressContract.getContractAddress(ingressContract.ADMIN_CONTRACT());

      require(adminContractAddress != address(0), 'Ingress contract must have Admin contract registered');
      require(Admin(adminContractAddress).isAuthorized(msg.sender), 'Sender not authorized');
    }
    _;
  }

  function upgradeVersion(address _newVersion) public onlyAdmin {
    emit VersionChange(latestVersion, _newVersion);
    latestVersion = _newVersion;
  }

  function policiesSize() public view returns (uint256) {
    return policylist.length;
  }

  function rolesSize() public view returns (uint256) {
    return rolelist.length;
  }

  function servicesSize() public view returns (uint256) {
    return servicelist.length;
  }

  function roleTypesSize() public view returns (uint256) {
    return roleTypelist.length;
  }

  function policyExists(uint256 _policyId) public view returns (bool) {
    return indexOfPolicy[_policyId] != 0;
  }

  function roleExists(uint256 _roleId) public view returns (bool) {
    return indexOfRoles[_roleId] != 0;
  }

  function serviceExists(uint256 _serviceId) public view returns (bool) {
    return indexOfServices[_serviceId] != 0;
  }

  function roleTypeExists(uint256 _roleTypeId) public view returns (bool) {
    return indexOfRoleTypes[_roleTypeId] != 0;
  }

  //** Add Role Types */
  function addRoleType(string memory roleTypeName, string memory roleAttributes) public onlyLatestVersion {
    roleTypesCount++; //Find a better way for unique Ids
    RoleTypes memory newRoleType = RoleTypes({roleTypeName: roleTypeName, roleTypeAttributes: roleAttributes});

    roleTypelist.push(roleTypesCount);
    indexOfRoleTypes[roleTypesCount] = roleTypelist.length;
    roleTypes[roleTypesCount] = newRoleType;
  }

  //** Add Roles */
  function addRole(
    string memory roleName,
    uint256 roleTypeId,
    string[] memory roleAttributes
  ) public onlyLatestVersion returns (uint256) {
    rolesCount++; //Find a better way for unique Ids
    Roles memory newRole = Roles({
      roleId: rolesCount,
      roleName: roleName,
      roleType: roleTypeId,
      roleAttributes: roleAttributes
    });

    rolelist.push(rolesCount);
    indexOfRoles[rolesCount] = rolelist.length;
    roles[rolesCount] = newRole;
    roleToTypes[newRole.roleId] = roleTypes[roleTypeId]; //Mapped the role to a type
    return newRole.roleId;
  }

  //** Add Services */
  function addService(
    string memory serviceName,
    string memory desc,
    string[] memory serviceConfig
  ) public onlyLatestVersion returns (uint256) {
    servicesCount++; //Find a better way for unique Ids
    Services memory newService = Services({
      serviceId: servicesCount,
      serviceName: serviceName,
      description: desc,
      serviceConfig: serviceConfig
    });

    servicelist.push(servicesCount);
    indexOfServices[servicesCount] = servicelist.length;
    services[servicesCount] = newService;
    return newService.serviceId;
  }

  //** Add Policies */
  function addPolicy(
    uint256[] memory policyRoles,
    uint256 policyService,
    address policyProvider,
    string memory hashedInfo
  ) public onlyLatestVersion returns (uint256) {
    policyCount++; //Find a better way for unique Ids
    Policies memory newPolicy = Policies({
      policyId: policyCount,
      policyRoles: policyRoles,
      policyService: policyService,
      policyProvider: policyProvider,
      hashedInfo: hashedInfo
    });

    policylist.push(policyCount);
    indexOfPolicy[policyCount] = policylist.length;
    policies[policyCount] = newPolicy;
    providedService[policyProvider] = services[policyService]; //Mapped the Provider to a Service

    return newPolicy.policyId;
  }

  //** Remove Roles */
  function removeRole(uint256 roleId) public onlyLatestVersion returns (bool) {
    uint256 index = indexOfRoles[roleId];
    if (index > 0 && index <= rolelist.length) {
      //1-based indexing
      //move last address into index being vacated (unless we are dealing with last index)
      if (index != rolelist.length) {
        uint256 lastRole = rolelist[rolelist.length - 1];
        rolelist[index - 1] = lastRole;
        indexOfRoles[lastRole] = index;
      }

      //shrink array
      rolelist.pop();
      indexOfRoles[roleId] = 0;
      delete roleToTypes[roleId];
      delete roles[roleId];

      return true;
    }
    return false;
  }

  //** Remove Services */
  function removeService(uint256 serviceId) public onlyLatestVersion returns (bool) {
    uint256 index = indexOfServices[serviceId];
    if (index > 0 && index <= servicelist.length) {
      //1-based indexing
      //move last address into index being vacated (unless we are dealing with last index)
      if (index != servicelist.length) {
        uint256 lastService = servicelist[servicelist.length - 1];
        servicelist[index - 1] = lastService;
        indexOfServices[lastService] = index;
      }

      //shrink array
      servicelist.pop();
      indexOfServices[serviceId] = 0;

      delete services[serviceId];

      return true;
    }
    return false;
  }

  //** Remove Policies */
  function removePolicy(uint256 policyId) public onlyLatestVersion returns (bool) {
    uint256 index = indexOfPolicy[policyId];
    if (index > 0 && index <= policylist.length) {
      //1-based indexing
      //move last address into index being vacated (unless we are dealing with last index)
      if (index != policylist.length) {
        uint256 lastPolicy = policylist[policylist.length - 1];
        policylist[index - 1] = lastPolicy;
        indexOfPolicy[lastPolicy] = index;
      }

      //shrink array
      policylist.pop();
      indexOfPolicy[policyId] = 0;
      address provider = policies[policyId].policyProvider;
      delete providedService[provider];
      delete policies[policyId];
      return true;
    }
    return false;
  }

  /*   //ADDED this function for modifying permissioned account information 
  function updateIdentityInfo(
    address _account,
    string memory hashedInfo,
    bool enrolled,
    string memory idType
  ) public onlyLatestVersion returns (bool) {
    string memory empty = '';
    uint256 index = indexOf[_account];
    if (index > 0) {
      if (keccak256(bytes(hashedInfo)) == keccak256(bytes(empty))) {
        updateIdentityEnroll(_account, enrolled);
        return true;
      } else {
        updateIdentity(_account, hashedInfo, idType);
        return true;
      }
    }
    return false;
  }

  //Update function helper
  function updateIdentityEnroll(address _account, bool enrolled) private {
    identity storage updateId = permInfo[_account];
    updateId.enrolled = enrolled;
  }

  //Update function helper
  function updateIdentity(
    address _account,
    string memory hashedInfo,
    string memory idType
  ) private {
    identity storage updateId = permInfo[_account];
    updateId.hashedInfo = hashedInfo;
    updateId.enrolled = true;
    updateId.idType = idType;
  }
 */
  function getRoleByIndex(uint256 index) public view returns (uint256 roleId) {
    return rolelist[index];
  }

  function getPolicyByIndex(uint256 index) public view returns (uint256 policyId) {
    return policylist[index];
  }

  function getServiceByIndex(uint256 index) public view returns (uint256 serviceId) {
    return servicelist[index];
  }

  function getRoleTypeByIndex(uint256 index) public view returns (uint256 roleTypeId) {
    return roleTypelist[index];
  }

  //** Full policy Information */
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
    return (
      policies[policyId].policyRoles,
      policies[policyId].policyService,
      policies[policyId].policyProvider,
      policies[policyId].hashedInfo
    );
  }

  //** Full Role Information */
  function getFullRoleById(uint256 roleId)
    public
    view
    returns (
      string memory roleName,
      uint256 roleType,
      string[] memory roleAttributes
    )
  {
    return (roles[roleId].roleName, roles[roleId].roleType, roles[roleId].roleAttributes);
  }

  //** Full Service Information */
  function getFullServiceById(uint256 serviceId)
    public
    view
    returns (
      string memory serviceName,
      string memory description,
      string[] memory serviceConfig
    )
  {
    return (services[serviceId].serviceName, services[serviceId].description, services[serviceId].serviceConfig);
  }

  //** Full RoleType Information */
  function getFullRoleTypeById(uint256 roleTypeId)
    public
    view
    returns (string memory roleTypeName, string memory roleTypeAttributes)
  {
    return (roleTypes[roleTypeId].roleTypeName, roleTypes[roleTypeId].roleTypeAttributes);
  }

  // The following function is for getting all the policies
  function getAllPolicies() public view returns (Policies[] memory) {
    uint256 itemCount = policylist.length;
    Policies[] memory items = new Policies[](itemCount);
    for (uint256 i = 0; i < itemCount; i++) {
      // I keep track of the policies in a mapping
      // It is saving the tokens of user in order
      uint256 policyId = policylist[i];
      Policies storage item = policies[policyId];
      items[i] = item;
    }
    return items;
  }

  function getPolicies() public view returns (uint256[] memory) {
    return policylist;
  }

  function getRoles() public view returns (uint256[] memory) {
    return servicelist;
  }

  function getServices() public view returns (uint256[] memory) {
    return rolelist;
  }

  function getRoleTypes() public view returns (uint256[] memory) {
    return roleTypelist;
  }
}
