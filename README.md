# An Integrated Blockchain and IPFS-based Solution for Secure and Efficient Source Code Repository Hosting

This repository contains the source code for the prototype system developed for the manuscript titled, "An Integrated Blockchain and IPFS-based Solution for Secure and Efficient Source Code Repository Hosting using a Middleman Approach" (PONE-D-24-43266), submitted to PLOS ONE.

This project demonstrates a novel, decentralized version control system (VCS) that leverages the Ethereum blockchain, IPFS, Shamir's Secret Sharing, and an optimistic retrieval protocol to provide a secure, resilient, and high-performance alternative to centralized systems like Git.

## System Architecture

The system consists of three main components that work in concert:

1.  **Client-Side dApp:** A browser-based decentralized application (dApp) that serves as the user interface. All cryptographic operations (encryption, key splitting) are performed client-side to ensure user data remains private.
2.  **Smart Contract (`VersionControl.sol`):** A Solidity smart contract deployed on the Ethereum (Sepolia testnet) blockchain. It acts as the authoritative, immutable ledger for repository ownership, access control, and the on-chain storage of one key share.
3.  **Middleman Server:** A lightweight, temporary key-share cache built with Node.js/Express and deployed as a serverless function. It enables the optimistic retrieval protocol by providing a "fast path" for collaborators to get a key share before the blockchain transaction is confirmed.

## Features

*   **Decentralized Ownership:** Repository ownership and access rights are controlled by an Ethereum smart contract, not a central provider.
*   **Trust-Minimized Security:** Uses Shamir's Secret Sharing (SSS) to split encryption keys. No single entity (owner, middleman, or blockchain) holds a complete key, eliminating single points of failure.
*   **High-Performance Workflow:** Employs an "Authoritative-First, Optimistic-Fallback" protocol that decouples the user experience from blockchain latency. User-perceived push times can be faster than a standard `git push`.
*   **End-to-End Encryption:** All repository data is encrypted client-side with AES-256 before being uploaded to IPFS.
*   **Publicly Verifiable:** All ownership and access grant transactions are publicly auditable on the blockchain.

## Repository Contents

*   `/`: Contains the client-side application (`index.html`, `style.css`, `app.js`) and its required libraries.
*   `/middleman-server`: Contains the Node.js source code (`server.js`) and configuration files (`package.json`, `vercel.json`) for the Vercel-deployed middleware.
*   `/`: Contains the final Solidity smart contract code (`VersionControl.sol`).

## Setup and Usage for Replication

To replicate the experiments described in the paper, please follow the steps outlined in the `Environment Setup and Implementation` section of the manuscript. The key steps involve:
1.  Deploying the `VersionControl.sol` contract to an Ethereum network (e.g., Sepolia testnet).
2.  Deploying the `middleman-server` code to a serverless platform.
3.  Updating the contract address and middleman URL in `app.js`.
4.  Running the dApp from a local web server.

## Citing This Work

If you use this code or refer to the concepts in your research, please cite our manuscript:

> [Full citation of your paper will go here once it is published]

---
_This repository is provided for academic and research purposes to ensure the reproducibility of our work._
