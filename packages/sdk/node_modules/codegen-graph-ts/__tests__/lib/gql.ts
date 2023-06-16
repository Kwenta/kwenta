import { wei } from '@synthetixio/wei';
import generateGql from '../../src/lib/gql';

describe.only('generateGql', () => {
    it('generates with no options', () => {
        expect(generateGql('foo', {}, { bar: true })).toEqual('{foo{bar}}');
    });

    it('generates with basic options', () => {
        expect(generateGql('foo', { first: 50, orderBy: 'name', orderDirection: 'desc' }, { bar: true })).toEqual(`{foo(first:50,orderBy:"name",orderDirection:"desc"){bar}}`);
    });

    it('generates with nested options', () => {
        expect(generateGql('foo', { first: 50, where: { name: 'boo' }, orderBy: 'name', orderDirection: 'desc' }, { bar: true })).toEqual(`{foo(first:50,where:{name:"boo"},orderBy:"name",orderDirection:"desc"){bar}}`);
    });

    it('nulls are written correctly', () => {
        expect(generateGql('foo', { first: 50, something: null }, { bar: true })).toEqual(`{foo(first:50,something:null){bar}}`);
    });

    it('floats are written correctly', () => {
        expect(generateGql('foo', { first: 50, something: 2.34 }, { bar: true })).toEqual(`{foo(first:50,something:2.34){bar}}`);
    });

    it('hex strings are quoted correctly', () => {
        expect(generateGql('foo', { where: {addr: '0x12341234123412341234'} }, { bar: true})).toEqual('{foo(where:{addr:"0x12341234123412341234"}){bar}}')
    })

    it('parses BigNumber and Wei in options', () => {
        expect(generateGql('foo', { first: wei(50) }, { bar: true })).toEqual(`{foo(first:50.000000000000000000){bar}}`);
        expect(generateGql('foo', { first: wei(50).toBN() }, { bar: true })).toEqual(`{foo(first:50000000000000000000){bar}}`);
    });

    it('handles multiple gql args', () => {
        expect(generateGql('foo', {}, { bar: true, baz: true })).toEqual(`{foo{bar baz}}`);
    });

    it('handles nested gql args', () => {
        expect(generateGql('foo', {}, { bar: true, baz: {one: true, two: true} })).toEqual(`{foo{bar baz{one two}}}`);
    });
});