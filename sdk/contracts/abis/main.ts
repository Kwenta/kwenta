export const StakingRewardsABI = [
	'function periodFinish() public view returns (uint256)',
	'function stake(uint256 amount) external',
	'function withdraw(uint256 amount) public',
	'function balanceOf(address account) external view returns (uint256)',
	'function earned(address account) external view returns (uint256)',
	'function rewardRate() public view returns (uint256)',
	'function totalSupply() public view returns (uint256)',
	'function getReward() public',
];
