// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;


contract emailRepo {
    /// @notice The name of this contract
    string public constant name = 'Employee Repo';

  

    /// @notice The address of the Governor Guardian. Initialy, the dev, until tests are completed.
    address public guardian;

        /// @notice The total number of employees
    uint256 public repoCount;

   
    struct Repo {
        //Unique id for looking up a repo
        uint256 id;
        //Unique password -> Created from IBN
        string uniquePass;
        //The name of the employee
        address verAddress;
        //The name of the employee
        string empName;
        //The email of the employee
        string email;
        //The id of the employee
        uint256 employeId;
        //Flag marking whether the record has been canceled
        bool canceled;
    }

    /// @notice Possible states that a repo may be in
    enum repoState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }


    
 
    // The official record of all employees
    mapping(uint256 => Repo) private repoList;


    //employees by employeId

    mapping(uint256=> uint256) public getRepoIdFromEmployeeId;

    //employees by email

    mapping(string=> uint256) public getRepoIdFromEmail;

    //employees by verificationAddress

    mapping(address=> uint256) private getRepoIdFromAddress;





    /// @notice An event emitted when a new repo is created
    event repoCreated(
        uint256 id,
        string empName,
        string email,
        uint256 employeId,
        string description
    );


    /// @notice An event emitted when a repo has been canceled
    event repoCanceled(uint256 id);

    constructor() {
        guardian = msg.sender;
    }

    function create(
        string memory empName,
        string memory email,
        uint256  employeId,
        string memory description
    ) public returns (uint256) {
        require(
            msg.sender == guardian,
            'emailRepo::__acceptAdmin: sender must be repo guardian'
        );


        repoCount++;
        Repo memory newRepo = Repo({
            id: repoCount,
            uniquePass: '',
            verAddress: 0x0000000000000000000000000000000000000000,
            empName: empName,
            email: email,
            employeId: employeId,
            canceled: false
        });

        repoList[newRepo.id] = newRepo;
        getRepoIdFromEmployeeId[employeId] = repoCount;
        getRepoIdFromEmail[email] = repoCount;


        emit repoCreated(
            newRepo.id,
            empName,
            email,
            employeId,
            description
        );
        return newRepo.id;
    }

   
    function _state(uint256 repoId) public view returns (repoState) {
        require(
            repoCount >= repoId && repoId > 0,
            'emailRepo::state: invalid repo id'
        );
        Repo storage repo = repoList[repoId];
        if (repo.canceled) {
            return repoState.Canceled;
        }
        else {
            return repoState.Active;
        }
    }

    //Do MFA verficiation by decoding signature and verifying the signer with the provided address. On the basis of the unique password stored in the blockchain
    function verifyMFA(bytes memory signature, address target) public view returns (bool correct) {
        require(
            msg.sender == guardian,
            'emailRepo::__acceptAdmin: sender must be repo guardian'
        );
        uint8 v;
        bytes32 r;
        bytes32 s;

        (v, r, s) = splitSignature(signature);
        uint256 id = getRepoIdFromAddress[target];    // Gets the Id of the requesting employee
        Repo storage repo = repoList[id];
        bytes32 senderHash = keccak256(abi.encodePacked(repo.uniquePass));
        address signer = ecrecover(senderHash, v, r, s);
        
        return (target == signer);
    }

    //Do MFA verficiation by decoding signature and verifying the signer with the provided address. On the basis of the unique password stored in the blockchain
    function verifyMFA2(address target, uint8 v, bytes32 r, bytes32 s ) public view returns (bool correct) {
        require(
            msg.sender == guardian,
            'emailRepo::__acceptAdmin: sender must be repo guardian'
        );
        uint256 id = getRepoIdFromAddress[target];    // Gets the Id of the requesting employee
        Repo storage repo = repoList[id];
        bytes32 senderHash = keccak256(abi.encodePacked(repo.uniquePass));
        address signer = ecrecover(senderHash, v, r, s);
        
        return (target == signer);
    }


    function getEmployeeByEmployeeId(uint256 _empId) public view returns(Repo memory){
        require(
            msg.sender == guardian,
            'emailRepo::__acceptAdmin: sender must be repo guardian'
        );
        uint256 id = getRepoIdFromEmployeeId[_empId];
        return repoList[id];
        }

    function getEmployeeInfo(uint256 _id) public view returns(Repo memory){
        require(
            msg.sender == guardian,
            'emailRepo::__acceptAdmin: sender must be repo guardian'
        );
        return repoList[_id];
        }


    function getEmployeeByEmail(string memory _email) public view returns(Repo memory){
        require(
            msg.sender == guardian,
            'emailRepo::__acceptAdmin: sender must be repo guardian'
        );
        uint256 id = getRepoIdFromEmail[_email];
        return repoList[id];
    }

    function cancel(uint256 repoId) public {
        repoState state = _state(repoId);
        require(
            state != repoState.Canceled,
            'emailRepo::cancel: cannot cancel repo'
        );

        require(
            msg.sender == guardian,
            'emailRepo::cancel: Only the admin can cancel a repo'
        ); //Guardian or Proposal creator can cancel.
        Repo storage repo = repoList[repoId];

        repo.canceled = true;
        emit repoCanceled(repoId);
    }

    function updatePass(uint256 repoId, string memory psswd) public {
        repoState state = _state(repoId);
        require(
            state != repoState.Canceled,
            'emailRepo::cancel: cannot update canceled repo'
        );       
        require(
            msg.sender == guardian,
            'emailRepo::cancel: Only the admin can update a repo'
        ); //Guardian or Proposal creator can cancel.
        Repo storage repo = repoList[repoId];
        repo.uniquePass = psswd;
    }

    function updateAddress(uint256 repoId, address theAddress) public {
        repoState state = _state(repoId);
        require(
            state != repoState.Canceled,
            'emailRepo::cancel: cannot update canceled repo'
        );

        require(
            msg.sender == guardian,
            'emailRepo::cancel: Only the admin can update a repo'
        ); //Guardian or Proposal creator can cancel.
        Repo storage repo = repoList[repoId];
        repo.verAddress = theAddress;
        getRepoIdFromAddress[theAddress] = repoId;
    }

    function __abdicate() public {
        require(
            msg.sender == guardian,
            'emailRepo::__abdicate: sender must be gov guardian'
        );
        guardian = address(0);
    }

    function _changeGuardian(address newGuard) public {
        require(
            msg.sender == guardian,
            'emailRepo::__abdicate: sender must be gov guardian'
        );
        guardian = newGuard;
    }

    // This will process the signature in a readable format for ecrecover()
    function splitSignature(bytes memory sig)
       internal
       pure
       returns (uint8, bytes32, bytes32)
   {
       require(sig.length == 65);
       
       bytes32 r;
       bytes32 s;
       uint8 v;

       assembly {
           // first 32 bytes, after the length prefix
           r := mload(add(sig, 32))
           // second 32 bytes
           s := mload(add(sig, 64))
           // final byte (first byte of the next 32 bytes)
           v := byte(0, mload(add(sig, 96)))
       }

       return (v, r, s);
   }


}


