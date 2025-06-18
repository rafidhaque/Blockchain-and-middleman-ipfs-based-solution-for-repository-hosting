// ===================================================================================
// SUPERIOR VERSION - V3.1 (Fully Instrumented) CONFIGURATION
// ===================================================================================
const CONTRACT_ADDRESS = "0x047Ca87302e7D8a0fc425DdF298F31Ca51095D1b"; 
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_collaboratorAddress",
				"type": "address"
			}
		],
		"name": "addCollaborator",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_onChainShare",
				"type": "string"
			}
		],
		"name": "registerRepository",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_collaboratorAddress",
				"type": "address"
			}
		],
		"name": "removeCollaborator",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_userAddress",
				"type": "address"
			}
		],
		"name": "checkAccess",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			}
		],
		"name": "getOnChainShare",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasAccess",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "owners",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]



const MIDDLEMAN_API_URL = "https://vcs-middleman-server.vercel.app";
// ===================================================================================

// --- Global variables, DOM elements, log function ---
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

// --- Initialize connections ---
async function init() {
    log('Initializing...');
    try {
        log('✅ V3.1 System Initialized (Owner-Centric, Instrumented).');
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

// --- V3 SUBMISSION PROCESS ---
async function submitRepository() {
    const file = fileInput.files[0];
    if (!file) return log('🚨 Please select a file first.');
    log('--- V3 Submission Process Starting ---');
    const startTime = performance.now();
    try {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const base64String = event.target.result.split(',')[1];
                log('1. Encrypting file...');
                const aesKey = CryptoJS.lib.WordArray.random(256 / 8), iv = CryptoJS.lib.WordArray.random(128 / 8);
                const encrypted = CryptoJS.AES.encrypt(base64String, aesKey, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
                const encryptionTime = performance.now();
                log(`   - Encryption Latency: ${(encryptionTime - startTime).toFixed(2)} ms.`);

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
                const uploadTime = performance.now();
                log(`   - IPFS Upload Latency: ${(uploadTime - encryptionTime).toFixed(2)} ms.`);
                ipfsHashResult.textContent = ipfsHash;
                
                log('3. Splitting keys and distributing shares...');
                const combinedSecret = CryptoJS.enc.Hex.stringify(aesKey) + CryptoJS.enc.Hex.stringify(iv);
                const shares = secrets.share(combinedSecret, 3, 2);
                const ownerShare = shares[0], onChainShare = shares[1], middlemanShare = shares[2];
                keySharesResult.textContent = `Owner's Share (Give this to collaborators!): ${ownerShare}\nOn-Chain Share: ${onChainShare}\nMiddleman Share: ${middlemanShare}`;
                
                log('4. Sending share to Middleman...');
                await fetch(`${MIDDLEMAN_API_URL}/share`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ipfsHash, middlemanShare }) });
                log('   - Middleman share stored.');
                
                log('5. Registering on Blockchain (with on-chain share)...');
                const tx = await contract.registerRepository(ipfsHash, onChainShare);
                const txSentTime = performance.now();
                log(`   - Transaction sent. Waiting for confirmation... (Tx hash: ${tx.hash})`);
                const receipt = await tx.wait();
                const confirmationTime = performance.now();
                log(`   - ✅ Transaction confirmed! Block: ${receipt.blockNumber}`);
                log(`   - Gas used: ${receipt.gasUsed.toString()}`);
                log(`   - Pure Blockchain Latency: ${(confirmationTime - txSentTime).toFixed(2)} ms.`);
            } catch (error) { log(`🚨 SUBMISSION FAILED (inner): ${error.message}`); }
        };
        reader.readAsDataURL(file);
    } catch (error) { log(`🚨 SUBMISSION FAILED (outer): ${error.message}`); }
}


// ===================================================================================
// THIS IS THE ONLY FUNCTION THAT HAS CHANGED
// ===================================================================================
// --- V3.1 RETRIEVAL PROCESS (OWNER-CENTRIC, INSTRUMENTED) ---
async function retrieveRepository() {
    const ipfsHash = retrieveHashInput.value;
    const ownerShare = ownerShareInput.value;

    if (!ipfsHash || !ownerShare) return log('🚨 Please provide an IPFS Hash and your Owner Share.');
    log('--- V3.1 Owner-Centric Retrieval (Blockchain First) ---');
    const startTime = performance.now();

    try {
        let combinedSecret;

        // STEP 1: PERMISSION CHECK - This is non-negotiable.
        log('1. Verifying access permission on the blockchain...');
        const userAddress = await signer.getAddress();
        const hasAccess = await contract.checkAccess(ipfsHash, userAddress);
        if (!hasAccess) return log('🚨 ACCESS DENIED: Your address does not have permission.');
        log('   - ✅ Access granted by blockchain.');

        // STEP 2: ATTEMPT TO GET THE SECOND SHARE
        // --- ATTEMPT 1: The "Authoritative Path" (Blockchain) ---
        try {
            log('2. Attempting to get share from Blockchain (authoritative path)...');
            const onChainShare = await contract.getOnChainShare(ipfsHash);
            if (onChainShare && onChainShare !== "") { // Check if the share is not empty
                log('   - ✅ Success! Got share from Blockchain.');
                combinedSecret = secrets.combine([ownerShare, onChainShare]);
            } else {
                // This error will be caught, triggering the fallback.
                throw new Error("On-chain share not found or empty (likely pending confirmation).");
            }
        } catch (e) {
            log(`   - Blockchain path failed: ${e.message}. Trying Middleman as optimistic fallback...`);
            // --- ATTEMPT 2: The "Optimistic Fallback" (Middleman) ---
            try {
                log('2. Attempting to get share from Middleman (fast fallback)...');
                const response = await fetch(`${MIDDLEMAN_API_URL}/share/${ipfsHash}`);
                if (!response.ok) throw new Error("Middleman server response not OK.");
                const data = await response.json();
                if (!data.success) throw new Error("Share not found in middleman.");
                
                const middlemanShare = data.middlemanShare;
                log('   - ✅ Success! Got share from Middleman fallback.');
                combinedSecret = secrets.combine([ownerShare, middlemanShare]);
            } catch (e2) {
                return log(`   - 🚨 RETRIEVAL FAILED: Fallback path also failed. ${e2.message}`);
            }
        }

        // STEP 3: RECONSTRUCT THE KEY
        const keyHex = combinedSecret.substring(0, 64);
        const ivHex = combinedSecret.substring(64);
        const finalKey = CryptoJS.enc.Hex.parse(keyHex);
        const finalIv = CryptoJS.enc.Hex.parse(ivHex);
        log('3. ✅ Key and IV reconstructed successfully.');

        // STEP 4: DOWNLOAD AND DECRYPT
        log('4. Downloading from Public IPFS Gateway...');
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        const response = await fetch(gatewayUrl);
        if (!response.ok) throw new Error(`IPFS Gateway Error: ${response.statusText}`);
        const encryptedStringFromIpfs = await response.text();
        const downloadTime = performance.now();
        log(`   - IPFS Download Latency: ${(downloadTime - startTime).toFixed(2)} ms.`); // Note: This includes key retrieval time.

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
        log(`--- ✅ Retrieval Complete! Total Time: ${(performance.now() - startTime).toFixed(2)} ms ---`);

    } catch (error) {
        log(`🚨 RETRIEVAL FAILED: ${error.message}`);
    }
}


// --- Access Management and Event Listeners ---
async function addCollaborator() {
    const ipfsHash = manageHashInput.value;
    const collaboratorAddress = collaboratorAddressInput.value;
    if (!ipfsHash || !collaboratorAddress || !ethers.utils.isAddress(collaboratorAddress)) return log('🚨 Invalid input.');
    log(`--- Adding Collaborator ${collaboratorAddress.substring(0, 8)}... to ${ipfsHash.substring(0, 8)}... ---`);
    try {
        const tx = await contract.addCollaborator(ipfsHash, collaboratorAddress);
        log(`   - Transaction sent. Waiting... (Tx: ${tx.hash.substring(0,10)}...)`);
        const receipt = await tx.wait();
        log(`   - ✅ Confirmed! Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error) { log(`🚨 FAILED to add collaborator: ${error.message}`); }
}
async function removeCollaborator() {
    const ipfsHash = manageHashInput.value;
    const collaboratorAddress = collaboratorAddressInput.value;
    if (!ipfsHash || !collaboratorAddress || !ethers.utils.isAddress(collaboratorAddress)) return log('🚨 Invalid input.');
    log(`--- Removing Collaborator ${collaboratorAddress.substring(0, 8)}... from ${ipfsHash.substring(0, 8)}... ---`);
    try {
        const tx = await contract.removeCollaborator(ipfsHash, collaboratorAddress);
        log(`   - Transaction sent. Waiting... (Tx: ${tx.hash.substring(0,10)}...)`);
        const receipt = await tx.wait();
        log(`   - ✅ Confirmed! Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error) { log(`🚨 FAILED to remove collaborator: ${error.message}`); }
}
window.addEventListener('load', init);
submitBtn.addEventListener('click', submitRepository);
retrieveBtn.addEventListener('click', retrieveRepository);
addCollaboratorBtn.addEventListener('click', addCollaborator);
removeCollaboratorBtn.addEventListener('click', removeCollaborator);
