const { Gateway } = require('fabric-network');

const getAllLeo = ({appUser, asLocalhost, channel, chaincode}, ccp, wallet) => async () => {
    const identity = await wallet.get(appUser);
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: appUser, discovery: { enabled: true, asLocalhost } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channel);

        // Get the contract from the network.
        const contract = network.getContract(chaincode);

        // Query the specified transaction.
        const result = await contract.evaluateTransaction('GetAll');
        console.log(result.toString());

        // Disconnect from the gateway.
        await gateway.disconnect();
}

module.exports = { getAllLeo }