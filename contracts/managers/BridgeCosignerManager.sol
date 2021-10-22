// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../interfaces/IBridgeCosignerManager.sol";

contract BridgeCosignerManager is IBridgeCosignerManager {
    using ECDSA for bytes32;

    mapping(address => Cosigner) public cosigners;
    uint8 public required;

    constructor(
        address[] memory cosigners_,
        uint256[] memory chainIds_,
        uint8 required_
    ) {
        require(
            cosigners_.length == chainIds_.length,
            "BridgeCosignerManager: MISMATCH_VERIFIERS"
        );
        require(required_ != 0, "BridgeCosignerManager: MISSED_REQUIRED_COUNT");
        require(
            required_ <= cosigners_.length,
            "BridgeCosignerManager: REQUIRED_MORE_THEN_COSIGNERS"
        );
        required = required_;
        for (uint8 i = 0; i < cosigners_.length; i++) {
            address signer = cosigners_[i];
            uint256 chainId = chainIds_[i];
            require(
                signer != address(0),
                "BridgeCosignerManager: ZERO_ADDRESS"
            );
            cosigners[signer] = Cosigner(signer, true, chainId);
        }
    }

    function recover(bytes32 hash, bytes calldata signature)
        internal
        pure
        returns (address)
    {
        return hash.toEthSignedMessageHash().recover(signature);
    }

    // TODO: Add cosigner impl
    // function addCosigner() external view;

    function verify(
        bytes32 commitment,
        uint256 chainId,
        bytes[] calldata signatures
    ) external view override returns (bool) {
        require(
            required <= signatures.length,
            "BridgeCosignerManager: MISMATCH_SIGNATURES"
        );

        address[] memory cached = new address[](signatures.length);
        uint8 signersMatch;

        for (uint8 i = 0; i < signatures.length; i++) {
            address signer = recover(commitment, signatures[i]);
            Cosigner memory cosigner = cosigners[signer];

            if (
                cosigner.active &&
                cosigner.chainId == chainId &&
                !inCache(cached, signer)
            ) {
                signersMatch++;
                cached[i] = signer;
                if (signersMatch == required) return true;
            }
        }

        return false;
    }

    function inCache(address[] memory cached, address signer)
        internal
        pure
        returns (bool hasCache)
    {
        for (uint8 j = 0; j < cached.length; j++) {
            if (cached[j] == signer) {
                hasCache = true;
                break;
            }
            // prevent iteration if cache not updated in slot
            if (cached[j] == address(0)) {
                break;
            }
        }
    }
}
