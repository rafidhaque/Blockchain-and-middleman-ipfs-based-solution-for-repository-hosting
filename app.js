// ===================================================================================
// IMPORTANT: CONFIGURE YOUR CONTRACT DETAILS HERE
// ===================================================================================
// 1. Get this from Remix after you deploy your contract
const CONTRACT_ADDRESS = "0x58f4C4D1589265A552d0b0159Fb9d2c01AC4DfE4"; 

// 2. Get this from the "ABI" button in Remix's compile tab
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
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_ipfsHash",
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
	}
]
// ===================================================================================


// --- Global variables for connections ---
let provider;
let signer;
let contract;
let ipfs;

// --- DOM elements ---
const submitBtn = document.getElementById('submit-btn');
const retrieveBtn = document.getElementById('retrieve-btn');
const fileInput = document.getElementById('file-input');
const retrieveHashInput = document.getElementById('retrieve-hash-input');
const share1Input = document.getElementById('share1-input');
const share2Input = document.getElementById('share2-input');
const share3Input = document.getElementById('share3-input');
const ipfsHashResult = document.getElementById('ipfs-hash-result');
const keySharesResult = document.getElementById('key-shares-result');
const retrievalResultsDiv = document.getElementById('retrieval-results');
const logOutput = document.getElementById('log-output');

const manageHashInput = document.getElementById('manage-hash-input');
const collaboratorAddressInput = document.getElementById('collaborator-address-input');
const addCollaboratorBtn = document.getElementById('add-collaborator-btn');
const removeCollaboratorBtn = document.getElementById('remove-collaborator-btn');


// --- Helper function to log messages to the screen ---
function log(message) {
    console.log(message);
    const time = new Date().toLocaleTimeString();
    logOutput.textContent += `[${time}] ${message}\n`;
}

// --- Initialize connections when the script loads ---
async function init() {
    log('Initializing...');
    try {
        // IPFS client is no longer needed for initialization.
        // We will call gateways directly.
        log('✅ Ready to use Public IPFS Gateways.');

        // Connect to MetaMask (Ethereum)
        if (window.ethereum) {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []); // Request wallet connection
            signer = provider.getSigner();
            const userAddress = await signer.getAddress();
            log(`✅ Connected to MetaMask. Wallet: ${userAddress}`);

            // Connect to the Smart Contract
            if(CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE" || CONTRACT_ABI.length === 0) {
                log("🚨 ERROR: Please set your CONTRACT_ADDRESS and CONTRACT_ABI in app.js!");
                alert("Please set your CONTRACT_ADDRESS and CONTRACT_ABI in app.js!");
                return;
            }
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            log(`✅ Connected to Smart Contract at ${CONTRACT_ADDRESS}`);

        } else {
            log('🚨 ERROR: MetaMask not found! Please install it.');
            alert("MetaMask not found! Please install it.");
        }
    } catch (error) {
        log(`🚨 Initialization Error: ${error.message}`);
        console.error(error);
    }
}


async function submitRepository() {
    const file = fileInput.files[0];
    if (!file) {
        log('🚨 Please select a file first.');
        return;
    }

    log('--- Starting Submission Process ---');
    const startTime = performance.now();

    try {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const base64String = event.target.result.split(',')[1];

                // 1. Client-Side Encryption
                log('1. Encrypting file with Key and IV...');
                const aesKey = CryptoJS.lib.WordArray.random(256 / 8);
                const iv = CryptoJS.lib.WordArray.random(128 / 8);
                const encrypted = CryptoJS.AES.encrypt(base64String, aesKey, {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });
                const encryptionTime = performance.now();
                log(`   - Encryption took ${(encryptionTime - startTime).toFixed(2)} ms.`);

                // =================================================================
                // 2. IPFS Upload (REPLACED WITH DIRECT PINATA API CALL)
                // =================================================================
                log('2. Uploading encrypted data to Pinata...');
                const encryptedStringForIpfs = encrypted.toString();
                
                const blob = new Blob([encryptedStringForIpfs], { type: 'text/plain' });
                const formData = new FormData();
                formData.append('file', blob, 'encrypted-repo.txt');
                
                const PINATA_API_KEY = '642e512ba111118fc498';
                const PINATA_API_SECRET = 'a00e4fa9f19c6c798edca8efa6f1b2dba3829e9af176ed58cf94a3d7bd992e38';

                const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
                    method: "POST",
                    headers: {
                        'pinata_api_key': PINATA_API_KEY,
                        'pinata_secret_api_key': PINATA_API_SECRET
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Pinata API Error: ${errorData.error.reason || response.statusText}`);
                }

                const result = await response.json();
                const ipfsHash = result.IpfsHash;
                // =================================================================
                // END OF REPLACED SECTION
                // =================================================================
                
                const uploadTime = performance.now();
                log(`   - IPFS upload took ${(uploadTime - encryptionTime).toFixed(2)} ms.`);
                log(`   - Client-Side Processing Latency ${((encryptionTime - startTime) + (uploadTime - encryptionTime)).toFixed(2)} ms.`);
                log(`   - IPFS Hash (CID): ${ipfsHash}`);
                ipfsHashResult.textContent = ipfsHash;

                // 3. Key & IV Bundling and Splitting
                log('3. Bundling Key+IV and splitting into shares...');
                const keyHex = CryptoJS.enc.Hex.stringify(aesKey);
                const ivHex = CryptoJS.enc.Hex.stringify(iv);
                const combinedSecret = keyHex + ivHex;
                const shares = secrets.share(combinedSecret, 3, 2);
                keySharesResult.textContent = `Share 1: ${shares[0]}\nShare 2: ${shares[1]}\nShare 3: ${shares[2]}`;
                log(`   - Share 1 (for 'middleman'): ${shares[0]}`);
                log(`   - Share 2 (user saves): ${shares[1]}`);
                log(`   - Share 3 (user saves): ${shares[2]}`);

                // 4. Blockchain Registration
                log('4. Registering repository on the blockchain...');
                const tx = await contract.registerRepository(ipfsHash);
                log(`   - Transaction sent. Waiting for confirmation... (Tx hash: ${tx.hash})`);
                const receipt = await tx.wait();
                const confirmationTime = performance.now();
                log(`   - ✅ Transaction confirmed! Block: ${receipt.blockNumber}`);
                log(`   - Gas used: ${receipt.gasUsed.toString()}`);
                log(`   - Blockchain confirmation took ${(confirmationTime - uploadTime).toFixed(2)} ms.`);
                const totalTime = performance.now() - startTime;
                log(`--- ✅ Submission Complete! Total time: ${totalTime.toFixed(2)} ms ---`);

            } catch (error) {
                log(`🚨 SUBMISSION FAILED (inner): ${error.message}`);
                console.error(error);
            }
        };
        reader.onerror = (error) => {
            log(`🚨 FILE READ FAILED: ${error}`);
            console.error(error);
        };
        reader.readAsDataURL(file);

    } catch (error) {
        log(`🚨 SUBMISSION FAILED (outer): ${error.message}`);
        console.error(error);
    }
}

// --- 3.4 Repository Retrieval Process ---
async function retrieveRepository() {
    const ipfsHash = retrieveHashInput.value;
    const shares = [share1Input.value, share2Input.value, share3Input.value].filter(s => s.trim() !== "");

    if (!ipfsHash || shares.length < 2) {
        log('🚨 Please provide an IPFS Hash and at least 2 key shares.');
        return;
    }

    log('--- Starting Retrieval Process ---');
    const startTime = performance.now();

    try {
        // 1. Permission Verification
        log('1. Verifying access permission on the blockchain...');
        const userAddress = await signer.getAddress();
        const hasAccess = await contract.checkAccess(ipfsHash, userAddress);
        if (!hasAccess) {
            log('🚨 ACCESS DENIED: Your address does not have permission for this repository.');
            return;
        }
        log('   - ✅ Access granted.');
        
        // 2. Key & IV Reconstruction
        log('2. Reconstructing and un-bundling Key and IV...');
        const combinedSecret = secrets.combine(shares);
        const keyHex = combinedSecret.substring(0, 64);
        const ivHex = combinedSecret.substring(64);
        const reconstructedKey = CryptoJS.enc.Hex.parse(keyHex);
        const reconstructedIv = CryptoJS.enc.Hex.parse(ivHex);
        log('   - ✅ Key and IV reconstructed successfully.');

        // =================================================================
        // 3. IPFS Download (REPLACED WITH PUBLIC GATEWAY CALL)
        // =================================================================
        log('3. Downloading encrypted data from a Public IPFS Gateway...');
        const gatewayUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
        
        const response = await fetch(gatewayUrl);

        if (!response.ok) {
            throw new Error(`IPFS Gateway Error: ${response.statusText}`);
        }
        
        const encryptedStringFromIpfs = await response.text();
        const downloadTime = performance.now();
        log(`   - Download took ${(downloadTime - startTime).toFixed(2)} ms.`);
        // =================================================================
        // END OF REPLACED SECTION
        // =================================================================
        
        // 4. Decryption
        log('4. Decrypting file with Key and IV...');
        const decrypted = CryptoJS.AES.decrypt(encryptedStringFromIpfs, reconstructedKey, {
            iv: reconstructedIv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        const decryptedBase64 = decrypted.toString(CryptoJS.enc.Utf8);
        const decryptionTime = performance.now();
        log(`   - Decryption took ${(decryptionTime - downloadTime).toFixed(2)} ms.`);

        // 5. Serve file for download
        const fileDataUrl = `data:application/octet-stream;base64,${decryptedBase64}`;
        const a = document.createElement('a');
        a.href = fileDataUrl;
        a.download = `decrypted_file.zip`;
        a.textContent = `Click here to download your decrypted file`;
        retrievalResultsDiv.innerHTML = '';
        retrievalResultsDiv.appendChild(a);
        log('   - ✅ File decrypted. Download link created.');

        const totalTime = performance.now() - startTime;
        log(`--- ✅ Retrieval Complete! Total time: ${totalTime.toFixed(2)} ms ---`);

    } catch (error) {
        log(`🚨 RETRIEVAL FAILED: ${error.message}`);
        console.error(error);
        if (error.message.includes("Invalid share")) {
             log("   - HINT: This often means the key shares are incorrect or in the wrong order.")
        } else if (error.message.includes("Malformed UTF-8 data")) {
             log("   - HINT: This often means the reconstructed key/IV is wrong (wrong shares?).")
        }
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