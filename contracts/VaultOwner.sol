pragma solidity ^0.8.0;

import "./ZolaVault.sol";

contract VaultOwner is Ownable {
    using SafeBEP20 for IBEP20;

    ZolaVault public immutable zolaVault;

    /**
     * @notice Constructor
     * @param _zolaVaultAddress: ZolaVault contract address
     */
    constructor(address _zolaVaultAddress) public {
        zolaVault = ZolaVault(_zolaVaultAddress);
    }

    /**
     * @notice Sets admin address to this address
     * @dev Only callable by the contract owner.
     * It makes the admin == owner.
     */
    function setAdmin() external onlyOwner {
        zolaVault.setAdmin(address(this));
    }

    /**
     * @notice Sets treasury address
     * @dev Only callable by the contract owner.
     */
    function setTreasury(address _treasury) external onlyOwner {
        zolaVault.setTreasury(_treasury);
    }

    /**
     * @notice Sets performance fee
     * @dev Only callable by the contract owner.
     */
    function setPerformanceFee(uint256 _performanceFee) external onlyOwner {
        zolaVault.setPerformanceFee(_performanceFee);
    }

    /**
     * @notice Sets call fee
     * @dev Only callable by the contract owner.
     */
    function setCallFee(uint256 _callFee) external onlyOwner {
        zolaVault.setCallFee(_callFee);
    }

    /**
     * @notice Sets withdraw fee
     * @dev Only callable by the contract owner.
     */
    function setWithdrawFee(uint256 _withdrawFee) external onlyOwner {
        zolaVault.setWithdrawFee(_withdrawFee);
    }

    /**
     * @notice Sets withdraw fee period
     * @dev Only callable by the contract owner.
     */
    function setWithdrawFeePeriod(uint256 _withdrawFeePeriod)
        external
        onlyOwner
    {
        zolaVault.setWithdrawFeePeriod(_withdrawFeePeriod);
    }

    /**
     * @notice Withdraw unexpected tokens sent to the Astro Vault
     */
    function inCaseTokensGetStuck(address _token) external onlyOwner {
        zolaVault.inCaseTokensGetStuck(_token);
        uint256 amount = IBEP20(_token).balanceOf(address(this));
        IBEP20(_token).safeTransfer(msg.sender, amount);
    }

    /**
     * @notice Triggers stopped state
     * @dev Only possible when contract not paused.
     */
    function pause() external onlyOwner {
        zolaVault.pause();
    }

    /**
     * @notice Returns to normal state
     * @dev Only possible when contract is paused.
     */
    function unpause() external onlyOwner {
        zolaVault.unpause();
    }
}
