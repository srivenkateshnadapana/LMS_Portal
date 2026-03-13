// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import \"forge-std/Script.sol";
import \"../contracts/CertNFT.sol";

contract DeployCertNFT is Script {
    function setUp() public virtual {}

    function run() external {
        uint256 deployerPrivateKey = vm.envUint(\"PRIVATE_KEY\");
        vm.startBroadcast(deployerPrivateKey);

        address owner = vm.addr(deployerPrivateKey);
        CertNFT certNFT = new CertNFT(owner);

        vm.stopBroadcast();

        console.log(\"CertNFT deployed at:\", address(certNFT));
        console.log(\"Owner:\", owner);
    }
}

