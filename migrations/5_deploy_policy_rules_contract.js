const Web3Utils = require("web3-utils");
//const AllowlistUtils = require('../scripts/allowlist_utils'); //Modify this to add initial polciies for Grafana and Prometheus

const Rules = artifacts.require("./PolicyRules.sol");
const PolicyIngress = artifacts.require("./PolicyIngress.sol");
const Admin = artifacts.require("./Admin.sol");
const PolicyStorage = artifacts.require("./PolicyStorage.sol");

const adminContractName = Web3Utils.utf8ToHex("administration");
const rulesContractName = Web3Utils.utf8ToHex("rules");
//const policyContractName = Web3Utils.utf8ToHex("PolicyRules");

/* The address of the account ingress contract if pre-deployed */
let policyIngress = process.env.POLICY_INGRESS_CONTRACT_ADDRESS;
/* The address of the account storage contract if pre-deployed */
let accountStorage = process.env.ACCOUNT_STORAGE_CONTRACT_ADDRESS;
let policyStorage = process.env.POLICY_STORAGE_CONTRACT_ADDRESS;

//let retainCurrentRulesContract = AllowlistUtils.getRetainAccountRulesContract();

async function logCurrentAllowlist(instance) {
    let currentAllowlist = await instance.getPolicies();
    console.log("\n<<< current POLICIES >>>", currentAllowlist);
    console.log(currentAllowlist);
    console.log("\n<<< end of current POLICIES >>>");
}

module.exports = async(deployer, network) => {
    // exit early if we are NOT redeploying this contract
/*     if (retainCurrentRulesContract) {
        console.log("not deploying AccountRules because retain=" + retainCurrentRulesContract);
        logCurrentAllowlist(await Rules.deployed());
        return;
    } */
    if (! policyIngress) {
        // Only deploy if we haven't been provided a pre-deployed address
        await deployer.deploy(PolicyIngress);
        console.log("   > Deployed PolicyIngress contract to address = " + PolicyIngress.address);
        policyIngress = PolicyIngress.address;

    }
    // If supplied an address, make sure there's something there
    const policyIngressInstance = await PolicyIngress.at(policyIngress);
    try {
        const result = await policyIngressInstance.getContractVersion();
        console.log("   > PolicyIngress contract initialised at address = " + policyIngress + " version=" + result);
    } catch (err) {
        console.log(err);
        console.error("   > Predeployed PolicyIngress contract is not responding like an PolicyIngress contract at address = " + policyIngress);
    }

    const admin = await Admin.deployed();
    await policyIngressInstance.setContractAddress(adminContractName, admin.address);
    console.log("   > Updated PolicyIngress with Admin address = " + admin.address);

    // STORAGE
    var storageInstance;
    if (! policyStorage) {
        // Only deploy if we haven't been provided a pre-deployed address
        storageInstance = await deployer.deploy(PolicyStorage, policyIngress);
        console.log("   > Deployed PolicyStorage contract to address = " + PolicyStorage.address);
        policyStorage = PolicyStorage.address;
    } else {
        // is there a storage already deployed
        storageInstance = await PolicyStorage.at(policyStorage);
        console.log(">>> Using existing PolicyStorage " + storageInstance.address);
        // TODO check that this contract is a storage contract eg call a method
    }

    // rules -> storage
    await deployer.deploy(Rules, policyIngress, policyStorage);
    console.log("   > Rules deployed with PolicyIngress.address = " + policyIngress + "\n   > and storageAddress = " + policyStorage);
    let policyRulesContract = await Rules.deployed();

    // storage -> rules
    await storageInstance.upgradeVersion(Rules.address);
    console.log("   >>> Set storage owner to Rules.address " + Rules.address);

/*     if (AllowlistUtils.isInitialAllowlistedAccountsAvailable()) {
        console.log("   > Adding Initial Allowlisted Accounts ...");
        let allowlistedAccounts = AllowlistUtils.getInitialAllowlistedAccounts();
        if (allowlistedAccounts.length > 0) {
            await policyRulesContract.addAccounts(allowlistedAccounts);
            console.log ("   > Initial Allowlisted Accounts added: " + allowlistedAccounts);
        }
    } */

    await policyIngressInstance.setContractAddress(rulesContractName, Rules.address);
    console.log("   > Updated PolicyIngress contract with Rules address = " + Rules.address);
    //console.log("POLICY RULES NAME", policyContractName)
    console.log(" RULES ", rulesContractName, Rules.address)


    logCurrentAllowlist(policyRulesContract);
}
