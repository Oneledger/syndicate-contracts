// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IBridgeTokenManager.sol";

contract BridgeTokenManager is Ownable, IBridgeTokenManager {
    uint8 public constant MAX_SIZE = 2;
    bytes32 private immutable _salt;

    mapping(bytes32 => Link) private _links;

    constructor() {
        _salt = keccak256(
            abi.encodePacked(
                blockhash(block.number - 1),
                block.timestamp,
                block.difficulty,
                block.coinbase
            )
        );
    }

    /**
     * @dev This should be responsible to get token mapping for current chain
     * @param addr address of token to get it's association
     * @param chainId of domain where token used
     */
    function fetch(address addr, uint256 chainId)
        public
        view
        override
        returns (Token memory token, bool ok)
    {
        Link memory link = _get(addr, chainId);
        if (!link.exist) {
            return (token, ok);
        }

        if (
            link.enterToken.chainId == chainId ||
            link.exitToken.chainId == chainId
        ) {
            token = link.enterToken;
            ok = true;
        }
        return (token, ok);
    }

    /**
     * @dev This should be responsible to remove tokens connection between chains
     * @param addr address of token to revoke
     * @param chainId of domain where token used
     */
    function revoke(address addr, uint256 chainId) external override onlyOwner {
        Link memory link = _get(addr, chainId);
        require(link.exist, "BridgeTokenManager: NOT_EXIST");

        _remove(link);

        emit LinkRemoved(link);
    }

    /**
     * @dev This should be responsible to connect tokens between chains
     * @param tokens addresses on link connection
     * @param issueTypes for tokens
     * @param chainIds where they are located
     */
    function issue(
        address[] calldata tokens,
        IssueType[] calldata issueTypes,
        uint256[] calldata chainIds
    ) external override onlyOwner {
        require(
            tokens.length == issueTypes.length,
            "BridgeTokenManager: WRONG_LENGTH"
        );
        require(
            tokens.length == chainIds.length,
            "BridgeTokenManager: WRONG_LENGTH"
        );
        require(tokens.length == MAX_SIZE, "BridgeTokenManager: MAX_SIZE");

        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        require(chainIds[0] == chainId, "BridgeTokenManager: WRONG_CHAIN_ID");

        Link memory link = _insert(
            Token(tokens[0], issueTypes[0], chainIds[0]),
            Token(tokens[1], issueTypes[1], chainIds[1])
        );

        emit LinkAdded(link);
    }

    function _set(Link memory link) private {
        _links[_key(link.enterToken.addr, link.enterToken.chainId)] = link;
        _links[_key(link.exitToken.addr, link.exitToken.chainId)] = link;
    }

    function _remove(Link memory link) private {
        delete _links[_key(link.enterToken.addr, link.enterToken.chainId)];
        delete _links[_key(link.exitToken.addr, link.exitToken.chainId)];
    }

    function _get(address addr, uint256 chainId)
        private
        view
        returns (Link memory link)
    {
        link = _links[_key(addr, chainId)];
    }

    function _key(address addr, uint256 chainId)
        private
        view
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_salt, addr, chainId));
    }

    function _insert(Token memory enterToken, Token memory exitToken)
        private
        returns (Link memory)
    {
        Link memory exitLink = _get(exitToken.addr, exitToken.chainId);
        require(!exitLink.exist, "BridgeTokenManager: EXIT_EXIST");

        Link memory link = Link(enterToken, exitToken, true);
        _set(link);

        return link;
    }
}
