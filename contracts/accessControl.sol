// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AccessControl
 * @dev Manages user roles and permissions within the system, with role hierarchies and expirations
 */
contract AccessControlContract {
    struct RoleData {
        mapping(address => bool) members;
        address[] memberList;
        bytes32 adminRole;  
        uint256 expiration; 
        bytes32 description; 
    }

    address public admin; 
    mapping(bytes32 => RoleData) private _roles;
    bytes32[] private _roleIds; 

    event RoleGranted(bytes32 indexed role, address indexed account, address indexed admin, uint256 expiration, bytes32 description);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed admin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "AccessControl: caller is not the admin");
        _;
    }

    modifier onlyRoleOrAdmin(bytes32 role) {
        require(msg.sender == admin || hasRole(role, msg.sender), "AccessControl: insufficient privileges");
        _;
    }

    constructor() {
        admin = msg.sender;
        bytes32 adminRole = 0x00;
        _grantRole(adminRole, msg.sender, "Admin", 0); 
    }

    /**
     * @dev Internal function to set up roles
     */
    function _setupRole(bytes32 role, address account, bytes32 description, uint256 expiration) internal {
        _grantRole(role, account, description, expiration);
    }

    /**
     * @dev Grant a role to a user
     * @param role bytes32 - Role identifier
     * @param account address - User address to grant the role to
     * @param expiration uint256 - Timestamp when the role expires, or 0 for permanent
     */
    function grantRole(bytes32 role, address account, bytes32 description, uint256 expiration) public {
        require(!hasRole(role, account), "AccessControl: account already has role");
        _roles[role].members[account] = true;
        _roles[role].memberList.push(account); 
        _roles[role].expiration = expiration;
        _roles[role].description = description;
        _roleIds.push(role); 
        emit RoleGranted(role, account, msg.sender, expiration, description);
    }

    /**
     * @dev Internal function to grant roles with expiration
     */
    function _grantRole(bytes32 role, address account, bytes32 description, uint256 expiration) internal {
        _roles[role].members[account] = true;
        _roles[role].memberList.push(account);
        _roles[role].expiration = expiration;
        _roles[role].description = description;
        _roleIds.push(role); 
        emit RoleGranted(role, account, msg.sender, expiration, description);
    }

    /**
     * @dev Revoke a role from a user
     * @param role bytes32 - Role identifier
     * @param account address - User address to revoke the role from
     */
    function revokeRole(bytes32 role, address account) public onlyRoleOrAdmin(role) {
        require(hasRole(role, account), "AccessControl: account does not have role");
        require(account != address(0), "AccessControl: invalid address");
        _roles[role].members[account] = false;
        emit RoleRevoked(role, account, msg.sender);
    }

    /**
     * @dev Check if a user has a specific role and if it is still valid
     * @param role bytes32 - Role identifier
     * @param account address - User address to check
     * @return bool - True if the user has the role and it hasn't expired, false otherwise
     */
    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role].members[account] && (_roles[role].expiration == 0 || block.timestamp <= _roles[role].expiration);
    }

    /**
     * @dev Get all role identifiers stored in the contract
     * @return bytes32[] - Array containing all role identifiers
     */
    function getAllRoles() public view returns (bytes32[] memory) {
        return _roleIds;
    }

    function getRoleDetails(bytes32 role) public view returns (bytes32 adminRole, uint256 expiration, bytes32 description, address[] memory members) {
        RoleData storage data = _roles[role];
        return (data.adminRole, data.expiration, data.description, data.memberList);
    }
}
