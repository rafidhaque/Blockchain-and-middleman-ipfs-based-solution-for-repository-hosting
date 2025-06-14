// ===================================================================================
// IMPORTANT: CONFIGURE YOUR CONTRACT DETAILS HERE
// ===================================================================================
// 1. Get this from Remix after you deploy your contract
const CONTRACT_ADDRESS = "0xBc3d2513436CE4097f202a39177Dd4010bB05A34"; 

// 2. Get this from the "ABI" button in Remix's compile tab
const CONTRACT_ABI = [ 
    // Paste the ABI array from Remix here
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
];
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
        // Connect to IPFS
        // CORRECTED: Use the variable name "IpfsHttpClient" (capital I)
        ipfs = IpfsHttpClient.create({ host: 'localhost', port: '5001', protocol: 'http' });
        log('✅ Connected to local IPFS node.');

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

// --- 3.3 Repository Submission Process ---
async function submitRepository() {
    const file = fileInput.files[0];
    if (!file) {
        log('🚨 Please select a file first.');
        return;
    }

    log('--- Starting Submission Process ---');
    const startTime = performance.now();

    try {
        // 1. Client-Side Encryption
        log('1. Encrypting file...');
        const fileBuffer = await file.arrayBuffer();
        const aesKey = CryptoJS.lib.WordArray.random(256 / 8); // 256-bit key
        const encrypted = CryptoJS.AES.encrypt(CryptoJS.lib.WordArray.create(fileBuffer), aesKey);
        const encryptionTime = performance.now();
        log(`   - Encryption took ${(encryptionTime - startTime).toFixed(2)} ms.`);

        // 2. IPFS Upload
        log('2. Uploading encrypted data to IPFS...');
        const encryptedData = new Uint8Array(Buffer.from(encrypted.toString(), 'base64'));
        const { cid } = await ipfs.add(encryptedData);
        const ipfsHash = cid.toString();
        const uploadTime = performance.now();
        log(`   - IPFS upload took ${(uploadTime - encryptionTime).toFixed(2)} ms.`);
        log(`   - IPFS Hash (CID): ${ipfsHash}`);
        ipfsHashResult.textContent = ipfsHash;

        // 3. Key Splitting with SSS
        log('3. Splitting AES key into 3 shares (k=2)...');
        const keyHex = CryptoJS.enc.Hex.stringify(aesKey);
        const shares = secrets.share(keyHex, 3, 2); // n=3, k=2
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
        log(`🚨 SUBMISSION FAILED: ${error.message}`);
        console.error(error);
    }
}

// --- 3.4 Repository Retrieval Process ---
async function retrieveRepository() {
    const ipfsHash = retrieveHashInput.value;
    const shares = [share1Input.value, share2Input.value, share3Input.value].filter(s => s.trim() !== ""); // Filter out empty shares

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
        
        // 2. Key Reconstruction
        log('2. Reconstructing AES key from shares...');
        const reconstructedKeyHex = secrets.combine(shares);
        const aesKey = CryptoJS.enc.Hex.parse(reconstructedKeyHex);
        log('   - ✅ Key reconstructed successfully.');

        // 3. IPFS Download
        log('3. Downloading encrypted data from IPFS...');
        const chunks = [];
        for await (const chunk of ipfs.cat(ipfsHash)) {
            chunks.push(chunk);
        }
        const encryptedData = Buffer.concat(chunks);
        const encryptedBase64 = encryptedData.toString('base64');
        const downloadTime = performance.now();
        log(`   - Download took ${(downloadTime - startTime).toFixed(2)} ms.`);

        // 4. Decryption
        log('4. Decrypting file...');
        const decrypted = CryptoJS.AES.decrypt(encryptedBase64, aesKey);
        const decryptedArray = new Uint8Array(Buffer.from(CryptoJS.enc.Latin1.stringify(decrypted), 'latin1'));
        const decryptionTime = performance.now();
        log(`   - Decryption took ${(decryptionTime - downloadTime).toFixed(2)} ms.`);

        // 5. Serve file for download
        const blob = new Blob([decryptedArray], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
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
        }
    }
}


// --- Event Listeners ---
window.addEventListener('load', init);
submitBtn.addEventListener('click', submitRepository);
retrieveBtn.addEventListener('click', retrieveRepository);