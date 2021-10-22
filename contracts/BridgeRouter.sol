// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./library/RLPReader.sol";
import "./versions/Version0.sol";
import "./interfaces/IBridgeCosignerManager.sol";
import "./interfaces/IBridgeToken.sol";
import "./interfaces/IBridgeTokenManager.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IOwnable.sol";

abstract contract AbstractBridgeStorage is
    Version0,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    mapping(address => uint256) internal _nonces;
    mapping(bytes32 => bool) internal _commitments;

    // (0.2%) hardcoded liquidity fee.
    // In future: shared between syndicate, relayers and lp providers
    uint256 public constant LIQUIDITY_FEE_NUMERATOR = 9980;
    uint256 public constant LIQUIDITY_FEE_DENOMINATOR = 10000;

    // ===== initialize override =====
    IBridgeCosignerManager internal _cosignerManager;
    IBridgeTokenManager internal _tokenManager;
    string internal _name;
    uint256 internal _chainId;
    bytes32 public DOMAIN_SEPARATOR;

    // ===== signing =====
    bytes32 internal constant ENTER_EVENT_SIG =
        keccak256("Enter(address,address,uint256,uint256,uint256,bytes32)");

    // ===== proxy =====

    uint256[49] private __gap;

    // ===== functionality to override =====

    /**
     * @dev Hook that is called after enter check. This includes
     * token deposit in according to the bridge direction.
     */
    function enterProcess(
        IBridgeTokenManager.Token memory tokenData,
        uint256 amount
    ) internal virtual;

    /**
     * @dev Hook that is called after exit check. This includes
     * token withdraw in according to the bridge direction.
     */
    function exitProcess(
        IBridgeTokenManager.Token memory tokenData,
        address to,
        uint256 amount
    ) internal virtual;

    // ===== domain =====

    function getChainId() external view returns (uint256) {
        return _chainId;
    }

    function _calculateDomainSeparator(string memory name, uint256 chainId)
        internal
        view
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    keccak256(
                        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                    ),
                    keccak256(bytes(name)),
                    keccak256(abi.encodePacked(VERSION)),
                    chainId,
                    address(this)
                )
            );
    }
}

contract BridgeRouter is AbstractBridgeStorage {
    using RLPReader for bytes;
    using RLPReader for RLPReader.RLPItem;

    // Initialize function for proxy constructor. Must be used atomically
    function initialize(
        string memory name_,
        IBridgeCosignerManager cosignerManager_,
        IBridgeTokenManager tokenManager_
    ) public initializer {
        _name = name_;
        _cosignerManager = cosignerManager_;
        _tokenManager = tokenManager_;
        assembly {
            sstore(_chainId.slot, chainid())
        }
        DOMAIN_SEPARATOR = _calculateDomainSeparator(_name, _chainId);

        // proxy inits
        __Context_init_unchained();
        __Ownable_init_unchained();
        __Pausable_init_unchained();
        __ReentrancyGuard_init_unchained();
    }

    event Enter(
        address indexed token,
        address indexed exitor,
        uint256 amount,
        uint256 nonce,
        uint256 chainId,
        bytes32 domain
    );

    function emitEnter(
        address token,
        address from,
        uint256 amount
    ) internal {
        emit Enter(
            token,
            from,
            amount,
            _nonces[from],
            _chainId,
            _calculateDomainSeparator(_name, _chainId)
        );
        _nonces[from]++;
    }

    event Exit(
        address indexed token,
        address indexed exitor,
        uint256 amount,
        bytes32 commitment,
        uint256 chainId,
        bytes32 domain
    );

    function emitExit(
        address token,
        address to,
        bytes32 commitment,
        uint256 amount
    ) internal {
        emit Exit(
            token,
            to,
            amount,
            commitment,
            _chainId,
            _calculateDomainSeparator(_name, _chainId)
        );
    }

    function unsafeTransfer(address to, uint256 amount) internal {
        require(address(this).balance >= amount, "BR: INSUFFICIENT_BALANCE");

        // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
        (bool success, ) = to.call{value: amount}("");
        require(success, "BR: SEND_REVERT");
    }

    /**
     * @notice Set the token manager, callable only by cosigners
     * @dev This should be the contract responsible for checking and add tokens to crosschain mapping
     * @param newTokenManager address of token manager contract
     */
    function setTokenManager(address newTokenManager) external onlyOwner {
        require(newTokenManager != address(0), "BR: ZERO_ADDRESS");
        _tokenManager = IBridgeTokenManager(newTokenManager);
    }

    /**
     * @notice Get the address of contract set as token manager
     * @return The address of token manager contract
     */
    function tokenManagerAddress() external view returns (address) {
        return address(_tokenManager);
    }

    /**
     * @notice Set the cosigner manager, callable only by cosigners
     * @dev This should be the contract responsible for sign by behalf of the payloads
     * @param newCosignerManager address of cosigner manager contract
     */
    function setCosignerManager(address newCosignerManager) external onlyOwner {
        require(newCosignerManager != address(0), "BR: ZERO_ADDRESS");
        _cosignerManager = IBridgeCosignerManager(newCosignerManager);
    }

    /**
     * @notice Get the address of contract set as cosigner manager
     * @return The address of cosigner manager contract
     */
    function cosignerManagerAddress() external view returns (address) {
        return address(_cosignerManager);
    }

    // enter amount of tokens to protocol
    function enter(address token, uint256 amount)
        external
        nonReentrant
        whenNotPaused
    {
        require(token != address(0), "BR: ZERO_ADDRESS");
        require(amount != 0, "BR: ZERO_AMOUNT");

        (IBridgeTokenManager.Token memory tokenData, bool ok) = _tokenManager
            .fetch(token, _chainId);
        require(ok, "BR: TOKEN_NOT_LISTED");
        enterProcess(tokenData, amount);

        emitEnter(token, _msgSender(), amount);
    }

    // enter amount of system currency to protocol
    function enterETH() external payable nonReentrant whenNotPaused {
        require(msg.value != 0, "BR: ZERO_AMOUNT");
        (, bool ok) = _tokenManager.fetch(address(0), _chainId);
        require(ok, "BR: TOKEN_NOT_LISTED");

        emitEnter(address(0), _msgSender(), msg.value);
    }

    // exit amount of tokens from protocol
    function exit(bytes calldata data, bytes[] calldata signatures)
        external
        nonReentrant
        whenNotPaused
    {
        RLPReader.RLPItem[] memory logRLPList = data.toRlpItem().toList();
        RLPReader.RLPItem[] memory logTopicRLPList = logRLPList[1].toList(); // topics

        require(
            bytes32(logTopicRLPList[0].toUint()) == ENTER_EVENT_SIG, // topic0 is event sig
            "BR: INVALID_EVT"
        );

        address exitToken = logTopicRLPList[1].toAddress();
        address to = logTopicRLPList[2].toAddress();
        require(to == _msgSender(), "BR: NOT_ONWER");

        uint256 amount = logRLPList[2].toUint();
        require(amount != 0, "BR: ZERO_AMOUNT");

        uint256 extChainId = logRLPList[3].toUint();
        require(extChainId != _chainId, "BR: WRONG_CHAIN");

        // protected from replay on another network
        bytes32 commitment = keccak256(
            abi.encodePacked(data, _calculateDomainSeparator(_name, _chainId))
        );

        require(!_commitments[commitment], "BR: COMMITMENT_KNOWN");
        require(
            _cosignerManager.verify(commitment, extChainId, signatures),
            "BR: INVALID_SIGNATURES"
        );

        _commitments[commitment] = true;

        (IBridgeTokenManager.Token memory enterToken, bool ok) = _tokenManager
            .fetch(exitToken, extChainId);
        require(ok, "BR: TOKEN_NOT_LISTED");

        exitProcess(enterToken, to, amount);
        emitExit(enterToken.addr, to, commitment, amount);
    }

    // ===== impl =====

    function enterProcess(
        IBridgeTokenManager.Token memory tokenData,
        uint256 amount
    ) internal override {
        if (tokenData.issueType == IBridgeTokenManager.IssueType.MINTABLE) {
            IBridgeToken(tokenData.addr).burn(_msgSender(), amount);
        } else if (
            tokenData.issueType == IBridgeTokenManager.IssueType.DEFAULT
        ) {
            IERC20(tokenData.addr).transferFrom(
                _msgSender(),
                address(this),
                amount
            );
        } else {
            // in case not correct choise, should not occur
            assert(false);
        }
    }

    function exitProcess(
        IBridgeTokenManager.Token memory tokenData,
        address to,
        uint256 amount
    ) internal override {
        if (tokenData.addr == address(0)) {
            unsafeTransfer(to, amount);
        } else if (
            tokenData.issueType == IBridgeTokenManager.IssueType.MINTABLE
        ) {
            IBridgeToken(tokenData.addr).mint(to, amount);
        } else if (
            tokenData.issueType == IBridgeTokenManager.IssueType.DEFAULT
        ) {
            IERC20(tokenData.addr).transfer(to, amount);
        } else {
            // in case not correct choise, should not occur
            assert(false);
        }
    }
}
