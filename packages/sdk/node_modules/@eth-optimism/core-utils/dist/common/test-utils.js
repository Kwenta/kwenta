"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectApprox = exports.awaitCondition = void 0;
const chai_1 = require("chai");
const bignumber_1 = require("@ethersproject/bignumber");
const misc_1 = require("./misc");
const awaitCondition = async (cond, rate = 1000, attempts = 10) => {
    for (let i = 0; i < attempts; i++) {
        const ok = await cond();
        if (ok) {
            return;
        }
        await (0, misc_1.sleep)(rate);
    }
    throw new Error('Timed out.');
};
exports.awaitCondition = awaitCondition;
const expectApprox = (actual, target, { percentUpperDeviation, percentLowerDeviation, absoluteUpperDeviation, absoluteLowerDeviation, }) => {
    actual = bignumber_1.BigNumber.from(actual);
    target = bignumber_1.BigNumber.from(target);
    const nonNullDeviations = percentUpperDeviation ||
        percentLowerDeviation ||
        absoluteUpperDeviation ||
        absoluteLowerDeviation;
    if (!nonNullDeviations) {
        throw new Error('Must define at least one parameter to limit the deviation of the actual value.');
    }
    let upper;
    const upperPcnt = !percentUpperDeviation
        ? null
        : target.mul(100 + percentUpperDeviation).div(100);
    const upperAbs = !absoluteUpperDeviation
        ? null
        : target.add(absoluteUpperDeviation);
    if (upperPcnt && upperAbs) {
        upper = upperPcnt.lte(upperAbs) ? upperPcnt : upperAbs;
    }
    else {
        upper = upperPcnt || upperAbs;
    }
    let lower;
    const lowerPcnt = !percentLowerDeviation
        ? null
        : target.mul(100 - percentLowerDeviation).div(100);
    const lowerAbs = !absoluteLowerDeviation
        ? null
        : target.sub(absoluteLowerDeviation);
    if (lowerPcnt && lowerAbs) {
        lower = lowerPcnt.gte(lowerAbs) ? lowerPcnt : lowerAbs;
    }
    else {
        lower = lowerPcnt || lowerAbs;
    }
    if (upper) {
        (0, chai_1.expect)(actual.lte(upper), `Actual value (${actual}) is greater than the calculated upper bound of (${upper})`).to.be.true;
    }
    if (lower) {
        (0, chai_1.expect)(actual.gte(lower), `Actual value (${actual}) is less than the calculated lower bound of (${lower})`).to.be.true;
    }
};
exports.expectApprox = expectApprox;
//# sourceMappingURL=test-utils.js.map