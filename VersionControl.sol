// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VersionControlV2 {
    // Mapping: ipfsHash -> owner's address
    mapping(string => address) public owners;

    // Mapping: ipfsHash -> user address -> access status (true/false)
    mapping(string => mapping(address => bool)) public hasAccess;

    // NEW: Mapping to store the "on-chain" key share
    // ipfsHash -> key share
    mapping(string => string) private onChainShares;

    modifier onlyOwner(string memory _ipfsHash) {
        require(msg.sender == owners[_ipfsHash], "Caller is not the owner");
        _;
    }

    // UPDATED: Now accepts a key share to store on-chain
    function registerRepository(string memory _ipfsHash, string memory _onChainShare) public {
        require(owners[_ipfsHash] == address(0), "Repository already registered");
        owners[_ipfsHash] = msg.sender;
        hasAccess[_ipfsHash][msg.sender] = true; // Owner also has access
        onChainShares[_ipfsHash] = _onChainShare;
    }

    function addCollaborator(string memory _ipfsHash, address _collaboratorAddress) public onlyOwner(_ipfsHash) {
        hasAccess[_ipfsHash][_collaboratorAddress] = true;
    }
    
    function removeCollaborator(string memory _ipfsHash, address _collaboratorAddress) public onlyOwner(_ipfsHash) {
        hasAccess[_ipfsHash][_collaboratorAddress] = false;
    }

    function checkAccess(string memory _ipfsHash, address _userAddress) public view returns (bool) {
        return hasAccess[_ipfsHash][_userAddress];
    }

    // NEW: Function to retrieve the on-chain share
    // It will only return the share if the user has access.
    function getOnChainShare(string memory _ipfsHash) public view returns (string memory) {
        require(hasAccess[_ipfsHash][msg.sender], "Access Denied");
        return onChainShares[_ipfsHash];
    }
}