Link to web store - https://chrome.google.com/webstore/detail/penumbra-wallet/lkpmkhpnhknhmibgnmmhdhgdilepfghe/related?hl=uk

## Install Penumbra protobuf types:
    -   npm install @buf/bufbuild_es_penumbra-zone_penumbra;
## Copy/paste ProviderPenumbra class to your project from https://github.com/zpoken/penumbra_dapp/blob/main/src/utils/ProviderPenumbra.ts;
## Web3 Browser Detection
-   To verify if the browser is running Penumbra, copy and paste the code snippet below in the developer console of your web browser:
    const checkIsPenumbraInstalled = async () => {
        const isInstalled = await isPenumbraInstalled();
        return isInstalled;
    };

## Create provider penumbra:
    const penumbra = new ProviderPenumbra(); 
## Connect dapp to wallet:
    const handleConnect = async () => {
        const data = await penumbra.login();
        console.log(data);
    };
## Get current status of chain sync
    penumbra.getStatus().then(data => console.log(data))
## Queries for notes that have been accepted by the core.chain.v1alpha1.
     penumbra.getNotes().then(data => console.log(data))
## Query for a note by its note commitment, optionally waiting until the note is detected.
     penumbra.getNoteByCommitment({noteCommitment}).then(data => console.log(data))
## Queries for assets.
     penumbra.getAssets().then(data => console.log(data))
## Query for the current chain parameters.
     penumbra.getChainParameters().then(data => console.log(data))
## Query for the transaction hashes in the given range of blocks.
     penumbra.getTransactionHashes().then(data => console.log(data))
## Query for the full transactions in the given range of blocks.
     penumbra.getTransactions().then(data => console.log(data))
## Query for a given transaction hash.
     penumbra.getTransactionByHash({txHash}).then(data => console.log(data))