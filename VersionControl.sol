pragma solidity ^0.8.20;

contract VersionControlV2 {
    mapping(string => address) public owners;
    mapping(string => mapping(address => bool)) public hasAccess;
    mapping(string => string) private onChainShares;

    modifier onlyOwner(string memory _ipfsHash) {
        require(msg.sender == owners[_ipfsHash], "Caller is not the owner");
        _;
    }

    function registerRepository(string memory _ipfsHash, string memory _onChainShare) public {
        require(owners[_ipfsHash] == address(0), "Repository already registered");
        owners[_ipfsHash] = msg.sender;
        hasAccess[_ipfsHash][msg.sender] = true; 
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

    function getOnChainShare(string memory _ipfsHash) public view returns (string memory) {
        require(hasAccess[_ipfsHash][msg.sender], "Access Denied");
        return onChainShares[_ipfsHash];
    }
}
