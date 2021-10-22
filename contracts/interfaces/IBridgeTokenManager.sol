// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IBridgeTokenManager {
    event LinkAdded(Link indexed link);
    event LinkRemoved(Link indexed link);

    enum IssueType {
        DEFAULT,
        MINTABLE
    }

    struct Token {
        address addr;
        IssueType issueType;
        uint256 chainId;
    }

    struct Link {
        Token enterToken;
        Token exitToken;
        bool exist;
    }

    function issue(
        address[] calldata tokens,
        IssueType[] calldata issueTypes,
        uint256[] calldata chainIds
    ) external;

    function revoke(address addr, uint256 chainId) external;

    function fetch(address addr, uint256 chainId)
        external
        view
        returns (Token memory token, bool ok);
}
