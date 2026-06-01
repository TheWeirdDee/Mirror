import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const agentWallet = deployer.address; // Use deployer as agent for now

  // 1. Deploy Conditions First (they don't depend on Matcher yet, but wait,
  // StagedReadCondition needs MirrorMatcher address. 
  // We have circular dependencies:
  // StagedReadCondition needs Matcher.
  // MirrorNDA needs Matcher.
  // NegotiationRights needs Matcher.
  // MirrorMatcher needs ReadCondition, MirrorNDA, NegotiationRights.
  
  // To solve this, we pre-compute the Matcher address, OR we deploy Matcher first
  // and pass the condition addresses later. BUT Matcher constructor requires them!
  // Wait, the ARCHITECTURE says:
  // "Since MirrorMatcher depends on the others, and the others require the MirrorMatcher address in their constructors..."
  // Solution: We must compute the MirrorMatcher address BEFORE deploying it using ethers.getCreateAddress.

  const transactionCount = await deployer.getNonce();
  // Matcher will be deployed 5th.
  // Deploy order:
  // 1: OwnerOnlyWriteCondition
  // 2: StagedReadCondition
  // 3: MirrorNDA
  // 4: NegotiationRights
  // 5: MirrorMatcher
  
  // So Matcher's nonce = transactionCount + 4
  const expectedMatcherAddress = ethers.getCreateAddress({
    from: deployer.address,
    nonce: transactionCount + 4,
  });

  console.log("Expected Matcher Address:", expectedMatcherAddress);

  // 1. OwnerOnlyWriteCondition
  const OwnerOnlyWriteCondition = await ethers.getContractFactory("contracts/OwnerOnlyWriteCondition.sol:OwnerOnlyWriteCondition");
  const ownerOnlyWriteCondition = await OwnerOnlyWriteCondition.deploy();
  await ownerOnlyWriteCondition.waitForDeployment();
  console.log("OwnerOnlyWriteCondition deployed to:", await ownerOnlyWriteCondition.getAddress());

  // 2. StagedReadCondition
  const StagedReadCondition = await ethers.getContractFactory("contracts/StagedReadCondition.sol:StagedReadCondition");
  const stagedReadCondition = await StagedReadCondition.deploy(expectedMatcherAddress);
  await stagedReadCondition.waitForDeployment();
  console.log("StagedReadCondition deployed to:", await stagedReadCondition.getAddress());

  // 3. MirrorNDA
  const MirrorNDA = await ethers.getContractFactory("contracts/MirrorNDA.sol:MirrorNDA");
  const mirrorNDA = await MirrorNDA.deploy(expectedMatcherAddress);
  await mirrorNDA.waitForDeployment();
  console.log("MirrorNDA deployed to:", await mirrorNDA.getAddress());

  // 4. NegotiationRights
  const NegotiationRights = await ethers.getContractFactory("contracts/NegotiationRights.sol:NegotiationRights");
  const negotiationRights = await NegotiationRights.deploy(expectedMatcherAddress);
  await negotiationRights.waitForDeployment();
  console.log("NegotiationRights deployed to:", await negotiationRights.getAddress());

  // 5. MirrorMatcher
  const MirrorMatcher = await ethers.getContractFactory("contracts/MirrorMatcher.sol:MirrorMatcher");
  const mirrorMatcher = await MirrorMatcher.deploy(
    await stagedReadCondition.getAddress(),
    await mirrorNDA.getAddress(),
    await negotiationRights.getAddress(),
    agentWallet
  );
  await mirrorMatcher.waitForDeployment();
  const actualMatcherAddress = await mirrorMatcher.getAddress();
  
  console.log("MirrorMatcher deployed to:", actualMatcherAddress);

  if (expectedMatcherAddress.toLowerCase() !== actualMatcherAddress.toLowerCase()) {
    console.warn("WARNING: Expected Matcher address did not match actual. Circular dependencies might fail.");
  } else {
    console.log("SUCCESS: Matcher address pre-computation matches perfectly.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
