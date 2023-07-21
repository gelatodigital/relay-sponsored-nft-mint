import { deployments, getNamedAccounts } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async () => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("GaslessNFT", {
    from: deployer,
    log: true,
    args: ["GEL", "GEL Gasless", "0xd8253782c45a12053594b9deB72d8e8aB2Fca54c"],
  });
};

func.tags = ["GaslessNFT"];

export default func;
