import { BigNumber } from 'ethers';

import { weiFromWei } from 'sdk/utils/number';
import { gweiToWei, formatDollars, stripZeros } from 'sdk/utils/number';

describe('number utils', () => {
	test('ether to gwei', () => {
		const gweiVal = gweiToWei('10');
		expect(gweiVal).toEqual('10000000000');
	});
	test('formats dollars', () => {
		let formatted = formatDollars('1000000000.764552');
		expect(formatted).toEqual('$1,000,000,000.76');

		formatted = formatDollars('0.004552');
		expect(formatted).toEqual('$0.00');
	});
	test('weiFromWei', () => {
		let weiVal = weiFromWei(BigNumber.from('100000000000000000'));
		expect(weiVal.toNumber()).toEqual(0.1);
	});
	test('should truncate millions correctly', () => {
		const formatted = formatDollars('3251764', { truncateOver: 1e3 });
		expect(formatted).toEqual('$3.25M');
	});
	test('should truncate thousands correctly', () => {
		const formatted = formatDollars('325764.27345', { truncateOver: 1e3 });
		expect(formatted).toEqual('$326K');
	});
	test('should strip traling zeros correctly', () => {
		let formatted = stripZeros('325764.2734500000');
		expect(formatted).toEqual('325764.27345');

		formatted = stripZeros('325760000');
		expect(formatted).toEqual('325760000');
	});
});
