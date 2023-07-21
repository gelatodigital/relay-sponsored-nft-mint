// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {
    ERC2771Context,
    Context
} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract GaslessNFT is ERC721, ERC2771Context {
    uint256 public supply;

    // solhint-disable no-empty-blocks
    constructor(
        string memory _name,
        string memory _symbol,
        address _gelatoRelay
    ) ERC721(_name, _symbol) ERC2771Context(_gelatoRelay) {}

    function mint() external {
        _safeMint(_msgSender(), supply++);
    }

    // Overrides needed due to multiple inheritance of Context:
    // https://docs.soliditylang.org/en/v0.8.19/contracts.html#function-overriding

    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address)
    {
        return ERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }
}
