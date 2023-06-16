import { Wei, wei } from './wei';
import Big from 'big.js';
import { BigNumber } from '@ethersproject/bignumber';

describe('Wei numeric type', () => {
  describe('Constructor', () => {
    it('denies null construction', () => {
      expect(Wei).toThrow();
    });

    it('constructs from a number', () => {
      const a = new Wei(14.3);
      expect(a.toBN()).toEqual(BigNumber.from('14300000000000000000'));
      const b = new Wei(14, 18, true);
      expect(b.toBN()).toEqual(BigNumber.from('14'));
    });

    it('constructs from a large formatted string', () => {
      const a = new Wei('1,214,114.3');
      expect(a.toBN()).toEqual(BigNumber.from('1214114300000000000000000'));
    });

    it('constructs from a smaller formatted string', () => {
      const a = new Wei('114.3');
      expect(a.toBN()).toEqual(BigNumber.from('114300000000000000000'));
    });

    it('constructs from a number', () => {
      const a = new Wei('14.3');
      expect(a.toBN()).toEqual(BigNumber.from('14300000000000000000'));
      const b = new Wei('14', 18, true);
      expect(b.toBN()).toEqual(BigNumber.from('14'));
    });

    it('constructs from a Big', () => {
      const a = new Wei(new Big('14.3'));
      expect(a.toBN()).toEqual(BigNumber.from('14300000000000000000'));
      const b = new Wei(new Big('14'), 18, true);
      expect(b.toBN()).toEqual(BigNumber.from('14'));
    });

    it('constructs from a BN', () => {
      const a = new Wei(BigNumber.from('14'));
      expect(a.toBN()).toEqual(BigNumber.from('14'));
    });

    it('copy constructs', () => {
      const a = new Wei('1', 18, true);
      const b = new Wei(a);
      expect(a != b);
      expect(a.eq(b));
    });
  });

  describe('Conversion operators', () => {
    let v: Wei;

    beforeEach(() => {
      v = new Wei('923.46');
    });

    it('converts to a string', () => {
      expect(v.toString()).toEqual('923.460000000000000000');
      expect(v.str).toEqual('923.460000000000000000');
      expect(v.toString(2)).toEqual('923.46');
      expect(v.toString(0, true)).toEqual('923460000000000000000');
    });

    it('converts to a BN', () => {
      expect(v.toBN()).toEqual(BigNumber.from('923460000000000000000'));
      expect(v.bn).toEqual(BigNumber.from('923460000000000000000'));
    });

    it('converts to a Big', () => {
      expect(v.toBig()).toEqual(new Big('923.46'));
      expect(v.toBig(true)).toEqual(new Big('923460000000000000000'));
    });

    it('converts to a number', () => {
      let t = v.toNumber();
      expect(Math.abs(t - 923.46) < 1e-12); // toNumber as a non-wei value; ${t}
      t = v.num;
      expect(Math.abs(t - 923.46) < 1e-12); // num as a non-wei value; ${t}
      t = v.toNumber(true);
      expect(Math.abs(t - 923.46 * 1e18) < 1e-12); // toNumber as a wei value; ${t}
    });

    it('converts sortable', () => {
      expect(v.toSortable()).toEqual(
        '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000003078333230663934663934633961336130303030'
      );
    });
  });

  describe('math operators', () => {
    let a: Wei, b: Wei, c: Wei;

    beforeEach(() => {
      a = new Wei('932.46', 15);
      b = new Wei('23.29467', 16);
      c = new Wei('-123.325');
    });

    it('scales', () => {
      expect(a.scale(15)).toEqual(a);
      expect(a.scale(18).toBN()).toEqual(BigNumber.from('932460000000000000000'));
    });

    it('abs', () => {
      expect(a.abs().eq(a)); // abs(a)
      expect(b.abs().eq(b)); // abs(b)
      expect(c.abs().eq(c.toBig().abs())); // abs(c)
    });

    it('neg', () => {
      expect(a.neg().eq('-932.46')); // neg(a)
      expect(b.neg().eq('-23.29467')); // neg(b)
      expect(c.neg().eq('123.325')); // neg(c)
    });

    it('div', () => {
      expect(a.div(a).feq(1, 1e-12)); // a / a
      expect(a.div(b).feq(a.toBig().div(b.toBig()), 1e-12)); // a / b
      expect(b.div(a).feq(b.toBig().div(a.toBig()), 1e-12)); // b / a
      expect(a.div(c).feq(a.toBig().div(c.toBig()), 1e-12)); // a / c
    });

    it('sub', () => {
      expect(a.sub(a).feq(0, 1e-12)); // a - a
      expect(a.sub(b).feq(a.toBig().sub(b.toBig()), 1e-12)); // a - b
      expect(b.sub(a).feq(b.toBig().sub(a.toBig()), 1e-12)); // b - a
      expect(a.sub(c).feq(a.toBig().sub(c.toBig()), 1e-12)); // a - c
    });

    it('add', () => {
      expect(a.add(b).feq(a.toBig().add(b.toBig()), 1e-12)); // a + b
      expect(b.add(a).feq(b.toBig().add(a.toBig()), 1e-12)); // b + a
      expect(a.add(c).feq(a.toBig().add(c.toBig()), 1e-12)); // a + c
    });

    it('mul', () => {
      expect(a.mul(b).feq(a.toBig().mul(b.toBig()), 1e-12)); // a * b
      expect(b.mul(a).feq(b.toBig().mul(a.toBig()), 1e-12)); // b * a
      expect(a.mul(c).feq(a.toBig().mul(c.toBig()), 1e-12)); // a * c
    });

    it('pow', () => {
      for (let i = 1; i < 6; ++i) {
        expect(a.pow(i).feq(a.toBig().pow(i), 1e-12)); // a^${i}
        expect(b.pow(i).feq(b.toBig().pow(i), 1e-12)); // b^${i}
        expect(c.pow(i).feq(c.toBig().pow(i), 1e-12)); // c^${i}
      }
    });

    it('inv', () => {
      expect(a.inv().feq(a.toBig().pow(-1), 1e-12)); // 1 / a
      expect(b.inv().feq(b.toBig().pow(-1), 1e-12)); // 1 / b
      expect(c.inv().feq(c.toBig().pow(-1), 1e-12)); // 1 / c
    });
  });

  describe('comparison operators', () => {
    const v = new Wei('3.14159');

    it('cmp', () => {
      expect(v.cmp(3) == 1);
      expect(v.cmp(4) == -1);
      expect(v.cmp(3.14159) == 0);
      expect(v.cmp(v.scale(15)) == 0);
    });

    it('eq', () => {
      expect(!v.eq(3.1));
      expect(v.eq(3.14159));
      expect(v.eq(v.scale(15)));
    });

    it('feq', () => {
      expect(!v.feq(4, 1e-2));
      expect(v.feq(4, 1));
      expect(v.feq(3.14159, 1e-10));
      expect(v.feq(v.scale(15), 1e-10));
    });

    it('gt', () => {
      expect(v.gt(2));
      expect(!v.gt(4));
      expect(!v.gt(3.14159));
    });

    it('gte', () => {
      expect(v.gte(2));
      expect(!v.gte(4));
      expect(v.gte(3.14159));
    });

    it('lt', () => {
      expect(v.lt(5));
      expect(!v.lt(2));
      expect(!v.lt(3.14159));
    });

    it('lte', () => {
      expect(v.lte(5));
      expect(!v.lte(2));
      expect(v.lte(3.14159));
    });
  });

  describe('static operators', () => {
    it('min', () => {
      expect(Wei.min(wei(1), wei(2), wei(3)).eq(1));
      expect(Wei.min(wei(2), wei(3), wei(1)).eq(1));
      expect(Wei.min(wei(2), wei(-3)).eq(-3));
      expect(Wei.min(wei(1)).eq(1));
    });

    it('max', () => {
      expect(Wei.max(wei(1), wei(2), wei(3)).eq(3));
      expect(Wei.max(wei(3), wei(2), wei(1)).eq(3));
      expect(Wei.max(wei(2), wei(-3)).eq(2));
      expect(Wei.max(wei(1)).eq(1));
    });

    it('avg', () => {
      expect(Wei.avg(wei(1)).eq(1));
      expect(Wei.avg(wei(2), wei(2)).eq(2));
      expect(Wei.avg(wei(5), wei(2), wei(8)).eq(5));
    });
  });

  describe('serialization', () => {
    it('JSON.stringify', () => {
      expect(JSON.stringify(new Wei(100))).toMatch(/"100.000000000000000000"/);
    });

    it('serialize and deserialize as new wei', () => {
      const wei = new Wei(100);
      const deserialized = JSON.parse(JSON.stringify(wei));
      const deserializedWei = new Wei(deserialized);
      expect(deserializedWei).toEqual(wei);
    });
  });
});
