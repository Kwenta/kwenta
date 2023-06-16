"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkNameById = exports.NetworkIdByName = exports.TransactionStatus = void 0;
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["AwaitingExecution"] = "AwaitingExecution";
    TransactionStatus["Executed"] = "Executed";
    TransactionStatus["Confirmed"] = "Confirmed";
    TransactionStatus["Failed"] = "Failed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
exports.NetworkIdByName = {
    mainnet: 1,
    goerli: 5,
    'goerli-ovm': 420,
    'mainnet-ovm': 10,
    kovan: 42,
    'kovan-ovm': 69,
    'mainnet-fork': 31337,
};
exports.NetworkNameById = {
    1: 'mainnet',
    5: 'goerli',
    42: 'kovan',
    10: 'mainnet-ovm',
    69: 'kovan-ovm',
    420: 'goerli-ovm',
    31337: 'mainnet-fork',
};
