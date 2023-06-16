"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const axios_1 = __importDefault(require("axios"));
const files_1 = require("../constants/files");
exports.client = axios_1.default.create({
    baseURL: `${files_1.FLEEK_BASE_URL}/${files_1.FLEEK_STORAGE_BUCKET}/data/`,
    timeout: 5000,
});
