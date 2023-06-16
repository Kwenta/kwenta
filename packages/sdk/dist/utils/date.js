"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextSunday = exports.formatTruncatedDuration = exports.truncateTimestamp = exports.formatTimer = exports.keepDoublePlaceholder = exports.calculatedTimeDifference = exports.formatShortDateWithoutYear = exports.formatDateWithoutYear = exports.calculateTimestampForPeriod = exports.WEEKS_IN_YEAR = exports.secondsToTime = exports.formatDateWithTime = exports.formatShortDateWithTime = exports.formatShortDateUTC = exports.formatChartDate = exports.formatChartTime = exports.formatShortDate = exports.toJSTimestamp = exports.formatTxTimestamp = void 0;
const differenceInSeconds_1 = __importDefault(require("date-fns/differenceInSeconds"));
const format_1 = __importDefault(require("date-fns/format"));
const getISOWeeksInYear_1 = __importDefault(require("date-fns/getISOWeeksInYear"));
const subHours_1 = __importDefault(require("date-fns/subHours"));
const string_1 = require("./string");
const formatTxTimestamp = (timestamp) => (0, format_1.default)(timestamp, 'MMM d, yy | HH:mm');
exports.formatTxTimestamp = formatTxTimestamp;
const toJSTimestamp = (timestamp) => timestamp * 1000;
exports.toJSTimestamp = toJSTimestamp;
const formatShortDate = (date) => (0, format_1.default)(date, 'yyyy-MM-dd');
exports.formatShortDate = formatShortDate;
const formatChartTime = (date) => (0, format_1.default)(date, 'E, h a');
exports.formatChartTime = formatChartTime;
const formatChartDate = (date) => (0, format_1.default)(date, 'M/d');
exports.formatChartDate = formatChartDate;
const formatShortDateUTC = (date) => {
    const dateString = new Date(date).toISOString();
    return dateString.substring(0, 10);
};
exports.formatShortDateUTC = formatShortDateUTC;
const formatShortDateWithTime = (date) => (0, format_1.default)(date, 'MMM d, yyyy h:mm a');
exports.formatShortDateWithTime = formatShortDateWithTime;
const formatDateWithTime = (date) => (0, format_1.default)(date, 'd MMM yyyy H:mm');
exports.formatDateWithTime = formatDateWithTime;
const secondsToTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds - minutes * 60;
    return `${(0, string_1.strPadLeft)(minutes, '0', 2)}:${(0, string_1.strPadLeft)(secondsLeft, '0', 2)}`;
};
exports.secondsToTime = secondsToTime;
exports.WEEKS_IN_YEAR = (0, getISOWeeksInYear_1.default)(new Date());
const calculateTimestampForPeriod = (periodInHours) => Math.trunc((0, subHours_1.default)(new Date().getTime(), periodInHours).getTime());
exports.calculateTimestampForPeriod = calculateTimestampForPeriod;
const formatDateWithoutYear = (date) => (0, format_1.default)(date, 'MMMM dd');
exports.formatDateWithoutYear = formatDateWithoutYear;
const formatShortDateWithoutYear = (date) => (0, format_1.default)(date, 'M/dd');
exports.formatShortDateWithoutYear = formatShortDateWithoutYear;
const calculatedTimeDifference = (dateLeft, dateRight) => (0, differenceInSeconds_1.default)(dateLeft, dateRight);
exports.calculatedTimeDifference = calculatedTimeDifference;
const keepDoublePlaceholder = (num) => (num < 9 ? `0${num}` : num);
exports.keepDoublePlaceholder = keepDoublePlaceholder;
const formatTimer = (seconds) => {
    const numMinutes = Math.floor(seconds / 60);
    const numSeconds = seconds % 60;
    return `${numMinutes}:${String(numSeconds).padStart(2, '0')}`;
};
exports.formatTimer = formatTimer;
const truncateTimestamp = (timestamp, delta) => {
    return Math.floor(timestamp / delta) * delta;
};
exports.truncateTimestamp = truncateTimestamp;
const formatTruncatedDuration = (delta) => {
    const days = Math.floor(delta / 86400);
    delta -= days * 86400;
    const hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    const minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    const daysStr = days > 0 ? days + 'd' : '0d';
    const hoursStr = hours > 0 ? hours + 'h' : '0h';
    const minsStr = minutes > 0 ? minutes + 'm' : '0m';
    return days > 10 ? `${daysStr}:${hoursStr}`.trim() : `${daysStr}:${hoursStr}:${minsStr}`.trim();
};
exports.formatTruncatedDuration = formatTruncatedDuration;
const getNextSunday = (date) => {
    const nextSunday = new Date();
    nextSunday.setDate(date.getDate() + (7 - date.getDay()));
    nextSunday.setHours(0, 0, 0, 0);
    return nextSunday;
};
exports.getNextSunday = getNextSunday;
