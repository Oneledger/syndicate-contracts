// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IBridgeTokenManager {
    event TokenAdded(address indexed addr, uint256 chainId);
    event TokenRemoved(address indexed addr, uint256 chainId);

    enum IssueType {
        DEFAULT,
        MINTABLE
    }

    struct Token {
        address addr;
        uint256 chainId;
        IssueType issueType;
        bool exist;
    }

    function issue(
        address[] calldata tokens,
        IssueType[] calldata issueTypes,
        uint256 targetChainId
    ) external;

    function revoke(address targetAddr) external;

    function getLocal(address sourceAddr, uint256 targetChainId)
        external
        view
        returns (Token memory token, bool ok);
}
