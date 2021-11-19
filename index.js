const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const { createLeo } = require('./functions/create.leo');
const { getLeo } = require('./functions/get.leo');
const { getAllLeo } = require('./functions/getAll.leo');
const { sleep } = require('./utils/sleep');
const {enroll, register} = require('./utils/wallet');


(async () => {
    const appConfig = path.resolve("./application.json");
    const CONFIG = JSON.parse(fs.readFileSync(appConfig, 'utf8'));
    const ccp = JSON.parse(fs.readFileSync(CONFIG.ccpPath, 'utf8'));
    
    const walletPath = path.join(process.cwd(), CONFIG.walletPath);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    await enroll(CONFIG, ccp, wallet);
    await register(CONFIG, ccp, wallet);

    // 키와 값을 변경하여 테스트
    const key = "키";
    const value = "값";
    await createLeo(CONFIG, ccp, wallet)(key, value);
    await sleep(3);
    await getLeo(CONFIG, ccp, wallet)(key);
    await getAllLeo(CONFIG, ccp, wallet)();
})()




