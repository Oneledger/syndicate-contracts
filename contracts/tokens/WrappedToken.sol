// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IWETH.sol";

contract WrappedToken is ReentrancyGuard, IWETH {
    string public name;
    string public symbol;
    uint8 public immutable decimals;

    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    receive() external payable {
        deposit();
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) {
        name = name_;
        symbol = symbol_;
        decimals = decimals_;
    }

    function deposit() public payable override {
        balanceOf[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 wad) public override nonReentrant {
        require(
            balanceOf[msg.sender] >= wad,
            "WrappedToken: INSUFFICIENT_AMOUNT"
        );
        balanceOf[msg.sender] -= wad;
        (bool success, ) = msg.sender.call{value: wad}("");
        require(success, "WrappedToken: TRANSFER_FAILED");
        emit Withdrawal(msg.sender, wad);
    }

    function totalSupply() public view override returns (uint256) {
        return address(this).balance;
    }

    function approve(address guy, uint256 wad) public override returns (bool) {
        allowance[msg.sender][guy] = wad;
        emit Approval(msg.sender, guy, wad);
        return true;
    }

    function transfer(address dst, uint256 wad) public override returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    function transferFrom(
        address src,
        address dst,
        uint256 wad
    ) public override returns (bool) {
        require(balanceOf[src] >= wad, "WrappedToken: INSUFFICIENT_AMOUNT");

        if (
            src != msg.sender && allowance[src][msg.sender] != type(uint256).max
        ) {
            require(
                allowance[src][msg.sender] >= wad,
                "WrappedToken: INSUFFICIENT_ALLOWANCE"
            );
            allowance[src][msg.sender] -= wad;
        }

        balanceOf[src] -= wad;
        balanceOf[dst] += wad;

        emit Transfer(src, dst, wad);

        return true;
    }
}
