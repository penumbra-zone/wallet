Link to web store - https://chrome.google.com/webstore/detail/penumbra-wallet/lkpmkhpnhknhmibgnmmhdhgdilepfghe/related?hl=uk

1.  Install Penumbra protobuf types:
    -   npm install @buf/bufbuild_es_penumbra-zone_penumbra;
2. Copy/paste ProviderPenumbra class to your project from https://github.com/zpoken/penumbra_dapp/blob/main/src/utils/ProviderPenumbra.ts;
3. Create provider penumbra:
    -   const penumbra = new ProviderPenumbra(); 
4.  Connect dapp to wallet:
    - const handleConnect = async () => {
        const data = await penumbra.login();
        console.log(data);
    };
4. You have access to  view service methods  - getAssets, getChainParameters, getNotes, getNoteByCommitment, getStatus, getTransactionHashes, getTransactionByHash, getTransactions, getFmdParameters
    -   penumbra.getAssets().then(data => console.log(data))