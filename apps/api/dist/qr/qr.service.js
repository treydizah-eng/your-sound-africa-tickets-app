"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const QRCode = __importStar(require("qrcode"));
let QrService = class QrService {
    constructor(config) {
        this.config = config;
    }
    signPayload(ticketId, orderId, showId) {
        const secret = this.config.get('QR_SECRET') || 'fallback-secret-change-me';
        const data = {
            tid: ticketId,
            oid: orderId,
            sid: showId,
            ts: Date.now(),
        };
        const str = JSON.stringify(data);
        const sig = crypto.createHmac('sha256', secret).update(str).digest('hex');
        return Buffer.from(JSON.stringify({ ...data, sig })).toString('base64url');
    }
    verifyPayload(payload) {
        try {
            const secret = this.config.get('QR_SECRET') || 'fallback-secret-change-me';
            const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
            const { sig, ...rest } = decoded;
            const str = JSON.stringify(rest);
            const expected = crypto.createHmac('sha256', secret).update(str).digest('hex');
            return { valid: sig === expected, data: decoded };
        }
        catch {
            return { valid: false };
        }
    }
    async generateDataUrl(payload) {
        return QRCode.toDataURL(payload, {
            errorCorrectionLevel: 'H',
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
        });
    }
    async generateBuffer(payload) {
        return QRCode.toBuffer(payload, {
            errorCorrectionLevel: 'H',
            width: 400,
            margin: 2,
        });
    }
};
exports.QrService = QrService;
exports.QrService = QrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QrService);
//# sourceMappingURL=qr.service.js.map