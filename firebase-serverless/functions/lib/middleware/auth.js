"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
async function ensureAuthenticated(token) {
    if (!token) {
        throw new Error('Token missing');
    }
    try {
        const user = (0, jsonwebtoken_1.verify)(token, '7783698978206a7dab23a62285724408');
        return user;
    }
    catch (error) {
        throw new Error('Invalid token');
    }
}
exports.ensureAuthenticated = ensureAuthenticated;
//# sourceMappingURL=auth.js.map