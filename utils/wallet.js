const FabricCAServices = require('fabric-ca-client');

async function enroll({certificateAuthorities, mspId}, ccp, wallet) {
    try {
        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities[certificateAuthorities];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get('admin');
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId,
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

async function register({certificateAuthorities, appUser, affiliation, mspId}, ccp, wallet) {
    try {
        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities[certificateAuthorities].url;
        const ca = new FabricCAServices(caURL);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(appUser);
        if (userIdentity) {
            console.log(`An identity for the user "${appUser}" already exists in the wallet`);
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation,
            enrollmentID: appUser,
            role: 'client'
        }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: appUser,
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId,
            type: 'X.509',
        };
        await wallet.put(appUser, x509Identity);
        console.log(`Successfully registered and enrolled admin user "${appUser}" and imported it into the wallet`);

    } catch (error) {
        console.error(`Failed to register user ${appUser}: ${error}`);
        process.exit(1);
    }
}

module.exports = {enroll, register}