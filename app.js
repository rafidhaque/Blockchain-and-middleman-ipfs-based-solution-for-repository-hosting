// ===================================================================================
// SUPERIOR VERSION - V3.0 (Owner-Centric Permission) CONFIGURATION
// ===================================================================================
const CONTRACT_ADDRESS = "0xe5784aa77cEAA8E9f92E18F81d6C0C36D719a7D5"; 
const CONTRACT_ABI = [
	{ "inputs": [ { "internalType": "string", "name": "_ipfsHash", "type": "string" }, { "internalType": "address", "name": "_collaboratorAddress", "type": "address" } ], "name": "addCollaborator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_ipfsHash", "type": "string" }, { "internalType": "address", "name": "_userAddress", "type": "address" } ], "name": "checkAccess", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_ipfsHash", "type": "string" } ], "name": "getOnChainShare", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "", "type": "string" }, { "internalType": "address", "name": "", "type": "address" } ], "name": "hasAccess", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "", "type": "string" } ], "name": "owners", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_ipfsHash", "type": "string" }, { "internalType": "string", "name": "_onChainShare", "type": "string" } ], "name": "registerRepository", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_ipfsHash", "type": "string" }, { "internalType": "address", "name": "_collaboratorAddress", "type": "address" } ], "name": "removeCollaborator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];
const MIDDLEMAN_API_URL = "http://localhost:3000";
// ===================================================================================

// --- Global variables, DOM elements, log function (No Changes) ---
let provider, signer, contract;
const submitBtn = document.getElementById('submit-btn');
const retrieveBtn = document.getElementById('retrieve-btn');
const fileInput = document.getElementById('file-input');
const ipfsHashResult = document.getElementById('ipfs-hash-result');
const keySharesResult = document.getElementById('key-shares-result');
const retrievalResultsDiv = document.getElementById('retrieval-results');
const logOutput = document.getElementById('log-output');
const retrieveHashInput = document.getElementById('retrieve-hash-input');
const ownerShareInput = document.getElementById('owner-share-input');
const manageHashInput = document.getElementById('manage-hash-input');
const collaboratorAddressInput = document.getElementById('collaborator-address-input');
const addCollaboratorBtn = document.getElementById('add-collaborator-btn');
const removeCollaboratorBtn = document.getElementById('remove-collaborator-btn');
function log(message) { console.log(message); logOutput.textContent += `[${new Date().toLocaleTimeString()}] ${message}\n`; }

// --- Initialize connections (No Changes) ---
async function init() {
    log('Initializing...');
    try {
        log('✅ V3.0 System Initialized (Owner-Centric Permission).');
        if (window.ethereum) {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            const userAddress = await signer.getAddress();
            log(`✅ Connected to MetaMask. Wallet: ${userAddress}`);
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            log(`✅ Connected to Smart Contract at ${CONTRACT_ADDRESS}`);
        } else { log('🚨 ERROR: MetaMask not found!'); }
    } catch (error) { log(`🚨 Initialization Error: ${error.message}`); }
}

// --- V3 SUBMISSION PROCESS (No Changes from V2) ---
async function submitRepository() {
    const file = fileInput.files[0];
    if (!file) return log('🚨 Please select a file first.');
    log('--- V3 Submission Process Starting ---');
    try {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const base64String = event.target.result.split(',')[1];
                log('1. Encrypting file...');
                const aesKey = CryptoJS.lib.WordArray.random(256 / 8);
                const iv = CryptoJS.lib.WordArray.random(128 / 8);
                const encrypted = CryptoJS.AES.encrypt(base64String, aesKey, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
                log('2. Uploading encrypted data to Pinata...');
                const blob = new Blob([encrypted.toString()], { type: 'text/plain' });
                const formData = new FormData();
                formData.append('file', blob, 'encrypted-repo.txt');
                const PINATA_API_KEY = '642e512ba111118fc498'; // Replace later
                const PINATA_API_SECRET = 'a00e4fa9f19c6c798edca8efa6f1b2dba3829e9af176ed58cf94a3d7bd992e38'; // Replace later
                const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", { method: "POST", headers: { 'pinata_api_key': PINATA_API_KEY, 'pinata_secret_api_key': PINATA_API_SECRET }, body: formData });
                if (!response.ok) throw new Error(`Pinata API Error: ${(await response.json()).error.reason}`);
                const result = await response.json();
                const ipfsHash = result.IpfsHash;
                ipfsHashResult.textContent = ipfsHash;
                log('3. Splitting keys and distributing shares...');
                const combinedSecret = CryptoJS.enc.Hex.stringify(aesKey) + CryptoJS.enc.Hex.stringify(iv);
                const shares = secrets.share(combinedSecret, 3, 2);
                const ownerShare = shares[0];
                const onChainShare = shares[1];
                const middlemanShare = shares[2];
                keySharesResult.textContent = `Owner's Share (Give this to collaborators!): ${ownerShare}\nOn-Chain Share: ${onChainShare}\nMiddleman Share: ${middlemanShare}`;
                log('4. Sending share to Middleman...');
                await fetch(`${MIDDLEMAN_API_URL}/share`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ipfsHash, middlemanShare }) });
                log('   - Middleman share stored.');
                log('5. Registering on Blockchain (with on-chain share)...');
                const tx = await contract.registerRepository(ipfsHash, onChainShare);
                log(`   - Transaction sent. It will confirm in the background... (Tx hash: ${tx.hash})`);
                await tx.wait();
                log(`   - ✅ Transaction confirmed!`);
            } catch (error) { log(`🚨 SUBMISSION FAILED (inner): ${error.message}`); }
        };
        reader.readAsDataURL(file);
    } catch (error) { log(`🚨 SUBMISSION FAILED (outer): ${error.message}`); }
}


// --- V3.0 RETRIEVAL PROCESS (OWNER-CENTRIC PERMISSION) ---
async function retrieveRepository() {
    const ipfsHash = retrieveHashInput.value;
    const ownerShare = ownerShareInput.value;

    if (!ipfsHash || !ownerShare) return log('🚨 Please provide an IPFS Hash and the Owner Share.');
    log('--- V3.0 Owner-Centric Retrieval ---');

    try {
        let combinedSecret;

        // STEP 1: ATTEMPT TO GET THE SECOND SHARE FROM THE FASTEST SOURCE FIRST
        // This is the core of your "Owner as Gatekeeper" model. We don't check permission first.
        try {
            log('1. Attempting to get share from Middleman (fastest path)...');
            const response = await fetch(`${MIDDLEMAN_API_URL}/share/${ipfsHash}`);
            if (!response.ok) throw new Error("Middleman response not OK.");
            const data = await response.json();
            if (!data.success) throw new Error("Share not found in middleman.");
            
            const middlemanShare = data.middlemanShare;
            log('   - ✅ Success! Got share from Middleman.');
            combinedSecret = secrets.combine([ownerShare, middlemanShare]);
        } catch (e) {
            log(`   - Middleman path failed: ${e.message}. Trying Blockchain as fallback...`);
            try {
                log('1. Attempting to get share from Blockchain (fallback path)...');
                const onChainShare = await contract.getOnChainShare(ipfsHash);
                 if (onChainShare) {
                    log('   - ✅ Success! Got share from Blockchain fallback.');
                    combinedSecret = secrets.combine([ownerShare, onChainShare]);
                } else {
                    throw new Error("Share also not found on-chain.");
                }
            } catch (e2) {
                return log(`   - 🚨 RETRIEVAL FAILED: Could not get a second share from any source. ${e2.message}`);
            }
        }

        // STEP 2: RECONSTRUCT THE KEY (If we got here, we have the key)
        const keyHex = combinedSecret.substring(0, 64);
        const ivHex = combinedSecret.substring(64);
        const finalKey = CryptoJS.enc.Hex.parse(keyHex);
        const finalIv = CryptoJS.enc.Hex.parse(ivHex);
        log('2. ✅ Key and IV reconstructed successfully.');

        // STEP 3: PERFORM AN OPTIONAL, NON-BLOCKING PERMISSION CHECK FOR UI
        log('3. Performing non-blocking on-chain verification...');
        const userAddress = await signer.getAddress();
        const hasAccess = await contract.checkAccess(ipfsHash, userAddress);
        if (hasAccess) {
            log('   - ✅ Verification Successful: Blockchain confirms you have access.');
        } else {
            log('   - ⚠️ Verification Warning: Blockchain has not yet confirmed your access. Proceeding with key.');
        }

        // STEP 4, 5, 6: DOWNLOAD, DECRYPT, AND SERVE (No changes)
        log('4. Downloading from Public IPFS Gateway...');
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        const response = await fetch(gatewayUrl);
        if (!response.ok) throw new Error(`IPFS Gateway Error: ${response.statusText}`);
        const encryptedStringFromIpfs = await response.text();
        log('5. Decrypting file...');
        const decrypted = CryptoJS.AES.decrypt(encryptedStringFromIpfs, finalKey, { iv: finalIv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        const decryptedBase64 = decrypted.toString(CryptoJS.enc.Utf8);
        const fileDataUrl = `data:application/octet-stream;base64,${decryptedBase64}`;
        const a = document.createElement('a');
        a.href = fileDataUrl;
        a.download = `decrypted_file.zip`;
        a.textContent = `Click here to download your decrypted file`;
        retrievalResultsDiv.innerHTML = '';
        retrievalResultsDiv.appendChild(a);
        log('6. ✅ File ready for download.');

    } catch (error) {
        log(`🚨 RETRIEVAL FAILED: ${error.message}`);
    }
}

// --- Access Management Functions ---
async function addCollaborator() {
    const ipfsHash = manageHashInput.value;
    const collaboratorAddress = collaboratorAddressInput.value;

    if (!ipfsHash || !collaboratorAddress) {
        log('🚨 Please provide a repository IPFS Hash and a Collaborator Address.');
        return;
    }
    if (!ethers.utils.isAddress(collaboratorAddress)) {
        log('🚨 Invalid Ethereum address provided for collaborator.');
        return;
    }

    log(`--- Adding Collaborator ${collaboratorAddress} to ${ipfsHash} ---`);
    try {
        const tx = await contract.addCollaborator(ipfsHash, collaboratorAddress);
        log(`   - Transaction sent. Waiting for confirmation... (Tx hash: ${tx.hash})`);
        const receipt = await tx.wait();
        log(`   - ✅ Transaction confirmed! Block: ${receipt.blockNumber}`);
        log(`   - Gas used for addCollaborator: ${receipt.gasUsed.toString()}`);
        log(`--- ✅ Collaborator Added Successfully ---`);
    } catch (error) {
        log(`🚨 FAILED to add collaborator: ${error.message}`);
        if(error.message.includes("Caller is not the owner")) {
            log("   - HINT: Make sure you are connected with the wallet that owns this repository.");
        }
    }
}

async function removeCollaborator() {
    const ipfsHash = manageHashInput.value;
    const collaboratorAddress = collaboratorAddressInput.value;

    if (!ipfsHash || !collaboratorAddress) {
        log('🚨 Please provide a repository IPFS Hash and a Collaborator Address.');
        return;
    }
     if (!ethers.utils.isAddress(collaboratorAddress)) {
        log('🚨 Invalid Ethereum address provided for collaborator.');
        return;
    }

    log(`--- Removing Collaborator ${collaboratorAddress} from ${ipfsHash} ---`);
    try {
        const tx = await contract.removeCollaborator(ipfsHash, collaboratorAddress);
        log(`   - Transaction sent. Waiting for confirmation... (Tx hash: ${tx.hash})`);
        const receipt = await tx.wait();
        log(`   - ✅ Transaction confirmed! Block: ${receipt.blockNumber}`);
        log(`   - Gas used for removeCollaborator: ${receipt.gasUsed.toString()}`);
        log(`--- ✅ Collaborator Removed Successfully ---`);
    } catch (error) {
        log(`🚨 FAILED to remove collaborator: ${error.message}`);
         if(error.message.includes("Caller is not the owner")) {
            log("   - HINT: Make sure you are connected with the wallet that owns this repository.");
        }
    }
}

// --- Event Listeners ---
window.addEventListener('load', init);
submitBtn.addEventListener('click', submitRepository);
retrieveBtn.addEventListener('click', retrieveRepository);
addCollaboratorBtn.addEventListener('click', addCollaborator);
removeCollaboratorBtn.addEventListener('click', removeCollaborator);