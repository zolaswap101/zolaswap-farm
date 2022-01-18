pragma solidity ^0.8.0;

import "./token/BEP20/BEP20.sol";

contract AdaToken is BEP20("Cardano", "ADA", 18) {
    constructor() {
        _mint(msg.sender, 100000 ether);
    }

    function mint() external {
        _mint(msg.sender, 100000 ether);
    }
}
