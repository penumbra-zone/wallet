### Local installation of wallet extension in chrome
1. `   npm install
`

2. `npm run start
`
3. Go to extensions management page in chrome [chrome://extensions/
](chrome://extensions/)
4. Enable Developer mode 
5. Use **Load Unpacked** and choose  path to `wallet/dist`



Link to web store - https://chrome.google.com/webstore/detail/penumbra-wallet/lkpmkhpnhknhmibgnmmhdhgdilepfghe/related?hl=uk

## Install Penumbra protobuf types:
    -   npm install @buf/bufbuild_es_penumbra-zone_penumbra;
## Copy/paste ProviderPenumbra class to your project from https://github.com/zpoken/penumbra_dapp/blob/main/src/utils/ProviderPenumbra.ts;
## Web3 Browser Detection(To verify if the browser is running Penumbra, copy and paste the code snippet below in the developer console of your web browser)
    const checkIsPenumbraInstalled = async () => {
        const isInstalled = await isPenumbraInstalled();
        return isInstalled;
    };

## Create provider penumbra:
    const penumbra = new ProviderPenumbra(); 
## Connect dapp to wallet:
    const handleConnect = async () => {
        const data = await penumbra.login();
    };
## Get current status of chain sync
    penumbra.getStatus()
## Queries for notes that have been accepted by the core.chain.v1alpha1.
     penumbra.getNotes()
## Query for a note by its note commitment, optionally waiting until the note is detected.
     penumbra.getNoteByCommitment({noteCommitment})
## Queries for assets.
     penumbra.getAssets()
## Query for the current chain parameters.
     penumbra.getChainParameters()
## Query for the full transactions in the given range of blocks.
     penumbra.getTransactionInfo({start_height,end_height})