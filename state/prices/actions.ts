import { createAsyncThunk } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';

import { notifyError } from 'components/ErrorView/ErrorNotifier';
import { SynthPrice, PricesMap, PriceType } from 'sdk/types/prices';
import { selectPrices } from 'state/prices/selectors';
import { AppThunk } from 'state/store';
import { ThunkConfig } from 'state/types';
import { resetExpiredPriceColors } from 'utils/prices';

import {
	setOffChainPriceColors,
	setOffChainPrices,
	setOnChainPriceColors,
	setOnChainPrices,
} from './reducer';
import { PriceColorMap } from './types';

export const updatePrices = (newPrices: PricesMap<string>, type: PriceType): AppThunk => (
	dispatch,
	getState
) => {
	const { prices } = getState();
	if (type === 'off_chain') {
		dispatch(setOffChainPrices(newPrices));
		dispatch(getPriceColors(prices.offChainPrices, newPrices, type));
	} else {
		dispatch(setOnChainPrices(newPrices));
		dispatch(getPriceColors(prices.onChainPrices, newPrices, type));
	}
};

const getPriceColors = (
	oldPrices: PricesMap<string>,
	newPrices: PricesMap<string>,
	type: PriceType
): AppThunk => (dispatch) => {
	let priceColors: PriceColorMap = {};

	let asset: keyof PricesMap;
	for (asset in newPrices) {
		const newPrice = wei(newPrices[asset]);
		const oldPrice = wei(oldPrices[asset]);

		priceColors[asset] = {
			color:
				!!newPrice && !!oldPrice
					? newPrice.gt(oldPrice)
						? 'green'
						: oldPrice.gt(newPrice)
						? 'red'
						: 'white'
					: 'white',
			expiresAt: Date.now() + 1000,
		};
	}

	if (type === 'off_chain') {
		dispatch(setOffChainPriceColors(priceColors));
	} else {
		dispatch(setOnChainPriceColors(priceColors));
	}

	setTimeout(() => {
		dispatch(resetPriceColors());
	}, 1000);
};

const resetPriceColors = createAsyncThunk<null, undefined, ThunkConfig>(
	'prices/resetPriceColors',
	async (_, { getState, dispatch }) => {
		try {
			const {
				prices: { offChainPriceColors, onChainPriceColors },
			} = getState();
			const newOffChainPriceColors = resetExpiredPriceColors(offChainPriceColors);
			const newOnChainPriceColors = resetExpiredPriceColors(onChainPriceColors);

			dispatch(setOffChainPriceColors(newOffChainPriceColors));
			dispatch(setOnChainPriceColors(newOnChainPriceColors));
			return null;
		} catch (err) {
			notifyError('Failed to reset price colors', err);
			throw err;
		}
	}
);

export const fetchPreviousDayPrices = createAsyncThunk<
	SynthPrice[],
	boolean | undefined,
	ThunkConfig
>('prices/fetchPreviousDayPrices', async (mainnet, { getState, extra: { sdk } }) => {
	try {
		const prices = selectPrices(getState());
		const marketAssets = Object.keys(prices);

		const laggedPrices = await sdk.prices.getPreviousDayPrices(
			marketAssets,
			mainnet ? 10 : undefined
		);

		return laggedPrices;
	} catch (err) {
		notifyError('Failed to fetch historical prices', err);
		throw err;
	}
});
