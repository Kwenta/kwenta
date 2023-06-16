import * as sgExchanges from '../../generated/exchanges';

import axios from 'axios';

jest.mock('axios');

const mockPost = axios.post as jest.MockedFunction<typeof axios.post>;

describe('postgen exchanges', () => {

    beforeEach(() => {
        mockPost.mockReset();
    })

    it('single call is correct', async () => {
        mockPost.mockResolvedValue({ data: { data: { total: {id: 'hello'} }}});
        const res = await sgExchanges.getTotalById('', { id: 'hello' }, { id: true });

        expect(res).toEqual({ id: 'hello' });

        expect(mockPost).toHaveBeenCalledWith('', { query: '{total(id:"hello"){id}}'});
    })

    it('multi call is correct', async () => {
        mockPost.mockResolvedValue({ data: { data: { totals: [{id: 'hello'}] }}});
        const res = await sgExchanges.getTotals('', { where: {id: 'hello'} }, { id: true });

        expect(res[0]).toEqual({ id: 'hello' });

        expect(mockPost).toHaveBeenCalledWith('', { query: '{totals(where:{id:"hello"}){id}}'});
    });

    it('pagination returns correct number of items', async () => {

        const bigReturn: {id: string}[] = Array.apply(null, Array(3000)).map(function (x, i) { return {id: `hello${i}`}; });

        mockPost.mockResolvedValueOnce({ data: { data: { totals: bigReturn.slice(0,1000) }}});
        mockPost.mockResolvedValueOnce({ data: { data: { totals: bigReturn.slice(1000,2000) }}});
        mockPost.mockResolvedValueOnce({ data: { data: { totals: bigReturn.slice(2000) }}});

        const res = await sgExchanges.getTotals('', { first: 2400, orderBy: 'id', orderDirection: 'asc' }, { id: true });

        expect(res).toHaveLength(2400);
        expect(res[0]).toEqual({ id: 'hello0' });

        expect(mockPost).toHaveBeenCalledTimes(3);
        expect(mockPost).toHaveBeenCalledWith('', { query: '{totals(first:1000,orderBy:"id",orderDirection:"asc",where:{}){id}}'});
        expect(mockPost).toHaveBeenCalledWith('', { query: '{totals(first:1000,orderBy:"id",orderDirection:"asc",where:{id_gt:"hello999"}){id}}'});
    });

    it('pagination succeeds even if not enough entries', async () => {

        const bigReturn: {id: string}[] = Array.apply(null, Array(1200)).map(function (x, i) { return {id: `hello${i}`}; });

        mockPost.mockResolvedValueOnce({ data: { data: { totals: bigReturn.slice(0,1000) }}});
        mockPost.mockResolvedValueOnce({ data: { data: { totals: bigReturn.slice(1000,2000) }}});
        mockPost.mockResolvedValueOnce({ data: { data: { totals: bigReturn.slice(2000) }}});

        const res = await sgExchanges.getTotals('', { first: 2400, orderBy: 'id', orderDirection: 'asc' }, { id: true });

        expect(res).toHaveLength(1200);
        expect(res[0]).toEqual({ id: 'hello0' });

        expect(mockPost).toHaveBeenCalledTimes(2);
        expect(mockPost).toHaveBeenCalledWith('', { query: '{totals(first:1000,orderBy:"id",orderDirection:"asc",where:{}){id}}'});
    });
});