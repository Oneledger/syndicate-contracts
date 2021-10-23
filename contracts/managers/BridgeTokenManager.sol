// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IBridgeTokenManager.sol";

contract BridgeTokenManager is Ownable, IBridgeTokenManager {
    uint8 public constant MAX_SIZE = 2;
    bytes32 private immutable _salt;
    uint256 private immutable _chainId;

    mapping(bytes32 => bytes32) private _keychain;
    mapping(bytes32 => Token) private _tokens;

    constructor() {
        _salt = keccak256(
            abi.encodePacked(
                blockhash(block.number - 1),
                block.timestamp,
                block.difficulty,
                block.coinbase
            )
        );
        uint256 chainId_;
        assembly {
            chainId_ := chainid()
        }
        _chainId = chainId_;
    }

    /**
     * @dev This should be responsible to get token mapping for current chain
     * @param sourceAddr address of source token
     * @param targetChainId of token on target
     */
    function getLocal(address sourceAddr, uint256 targetChainId)
        public
        view
        override
        returns (Token memory token, bool ok)
    {
        bytes32 tokenKey = _keychain[createKey(sourceAddr, targetChainId)];
        if (tokenKey == 0) {
            return (token, ok);
        }
        bytes32 sourceKey;
        if (_chainId != targetChainId) {
            sourceKey = tokenKey;
        } else {
            sourceKey = _keychain[tokenKey];
        }
        token = _tokens[sourceKey];
        if (!token.exist) {
            return (token, ok);
        }
        ok = true;
    }

    /**
     * @dev This should be responsible to remove tokens connection between chains
     * @param targetAddr address of target token
     */
    function revoke(address targetAddr) external override onlyOwner {
        bytes32 sourceKey = _keychain[createKey(targetAddr, _chainId)];
        require(sourceKey != 0, "BTM: NOT_EXIST");

        bytes32 targetKey = _keychain[sourceKey];
        require(targetKey != 0, "BTM: NOT_EXIST");

        delete _keychain[sourceKey];
        delete _keychain[targetKey];

        Token memory sourceToken = _tokens[sourceKey];
        Token memory targetToken = _tokens[targetKey];

        delete _tokens[sourceKey];
        delete _tokens[targetKey];

        emit TokenRemoved(sourceToken.addr, sourceToken.chainId);
        emit TokenRemoved(targetToken.addr, targetToken.chainId);
    }

    /**
     * @dev This should be responsible to connect tokens between chains
     * @param tokens addresses on link connection
     * @param issueTypes for tokens
     * @param targetChainId of remote token
     */
    function issue(
        address[] calldata tokens,
        IssueType[] calldata issueTypes,
        uint256 targetChainId
    ) external override onlyOwner {
        require(tokens.length == issueTypes.length, "BTM: WRONG_LENGTH");
        require(tokens.length == MAX_SIZE, "BTM: MAX_SIZE");

        bytes32 sourceKey = createKey(tokens[1], _chainId);
        require(_keychain[sourceKey] == 0, "BTM_EXIST");

        bytes32 targetKey = createKey(tokens[0], targetChainId);
        require(_keychain[targetKey] == 0, "BTM_EXIST");

        // linking
        _keychain[sourceKey] = targetKey;
        _keychain[targetKey] = sourceKey;

        Token memory sourceToken = Token(
            tokens[0],
            _chainId,
            issueTypes[0],
            true
        );
        Token memory targetToken = Token(
            tokens[1],
            targetChainId,
            issueTypes[1],
            true
        );

        _tokens[sourceKey] = sourceToken;
        _tokens[targetKey] = targetToken;

        emit TokenAdded(sourceToken.addr, sourceToken.chainId);
        emit TokenAdded(targetToken.addr, targetToken.chainId);
    }

    function createKey(address sourceAddr, uint256 targetChainId)
        private
        view
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_salt, sourceAddr, targetChainId));
    }
}
