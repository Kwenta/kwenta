"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MILLISECONDS_PER_DAY = exports.SECONDS_PER_DAY = exports.PERIOD_IN_SECONDS = exports.PERIOD_IN_HOURS = exports.PERIOD_DISPLAY = exports.Period = void 0;
var Period;
(function (Period) {
    Period["ONE_HOUR"] = "ONE_HOUR";
    Period["FOUR_HOURS"] = "FOUR_HOURS";
    Period["ONE_DAY"] = "ONE_DAY";
    Period["ONE_WEEK"] = "ONE_WEEK";
    Period["TWO_WEEKS"] = "TWO_WEEKS";
    Period["ONE_MONTH"] = "ONE_MONTH";
    Period["ONE_YEAR"] = "ONE_YEAR";
})(Period || (exports.Period = Period = {}));
exports.PERIOD_DISPLAY = {
    ONE_HOUR: '1H',
    FOUR_HOURS: '4H',
    ONE_DAY: '1D',
    ONE_WEEK: '1W',
    TWO_WEEKS: '2W',
    ONE_MONTH: '1M',
    ONE_YEAR: '1Y',
};
exports.PERIOD_IN_HOURS = {
    ONE_HOUR: 1,
    FOUR_HOURS: 4,
    ONE_DAY: 24,
    ONE_MONTH: 672,
    ONE_WEEK: 168,
    TWO_WEEKS: 336,
    ONE_YEAR: 8766,
};
exports.PERIOD_IN_SECONDS = {
    ONE_HOUR: 60 * 60,
    FOUR_HOURS: 4 * 60 * 60,
    ONE_DAY: 24 * 60 * 60,
    ONE_MONTH: 672 * 60 * 60,
    ONE_WEEK: 168 * 60 * 60,
    TWO_WEEKS: 336 * 60 * 60,
    ONE_YEAR: 8766 * 60 * 60,
};
exports.SECONDS_PER_DAY = 24 * 60 * 60;
exports.MILLISECONDS_PER_DAY = exports.SECONDS_PER_DAY * 1000;
