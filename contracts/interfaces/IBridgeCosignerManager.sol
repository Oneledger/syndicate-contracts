// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IBridgeCosignerManager {
    struct Cosigner {
        address addr;
        bool active;
        uint256 chainId;
    }

    function verify(
        bytes32 commitment,
        uint256 chainId,
        bytes[] calldata signatures
    ) external view returns (bool);
}
