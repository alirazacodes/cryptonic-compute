// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DataManager
 * @dev Storage, retrieval, and management of encrypted data CIDs
 */
contract DataManager {
    mapping(bytes32 => string) private dataStorage;
    mapping(address => bool) public isAuthorized;

    event DataSubmitted(bytes32 indexed dataId, string cid, address indexed submitter);
    event DataRetrieved(bytes32 indexed dataId, string cid, address indexed retriever);
    event AuthorizationChanged(address indexed account, bool isAuthorized);

    constructor() {
        isAuthorized[msg.sender] = true;
    }

    modifier onlyAuthorized() {
        require(isAuthorized[msg.sender], "DataManager: Unauthorized access");
        _;
    }

    /**
    * @dev Authorize or deauthorize an address
    * @param account address - Address to modify authorization
    * @param _isAuthorized bool - Set true to authorize, false to deauthorize
    */
    function setAuthorization(address account, bool _isAuthorized) external onlyAuthorized {
        isAuthorized[account] = _isAuthorized;
        emit AuthorizationChanged(account, _isAuthorized);
    }

    /**
    * @dev Submit data to the contract. Stores the CID linked to a unique dataId
    * @param dataId bytes32 - Unique identifier of data/ hash of the data or metadata
    * @param cid string - CID of the data stored in IPFS
    */
    function submitData(bytes32 dataId, string calldata cid) external onlyAuthorized {
        require(bytes(cid).length > 0, "DataManager: CID cannot be empty");
        require(bytes(dataStorage[dataId]).length == 0, "DataManager: Data already submitted for this ID");

        dataStorage[dataId] = cid;
        emit DataSubmitted(dataId, cid, msg.sender);
    }

    /**
    * @dev Retrieve data from the contract, returns the CID linked to the unique dataId
    * @param dataId bytes32 - Unique identifier for the data
    * @return cid string - CID of the data stored in IPFS
    */
    function retrieveData(bytes32 dataId) external onlyAuthorized returns (string memory cid) {
        cid = dataStorage[dataId];
        require(bytes(cid).length > 0, "DataManager: No data submitted for this ID");

        emit DataRetrieved(dataId, cid, msg.sender);
        return cid;
    }

    function checkDataExists(bytes32 dataId) public view returns (bool) {
        return bytes(dataStorage[dataId]).length > 0;
    }
}
