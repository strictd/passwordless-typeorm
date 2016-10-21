"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var typeorm_1 = require('typeorm');
var Passwordless = (function () {
    function Passwordless() {
    }
    __decorate([
        typeorm_1.PrimaryColumn('string'), 
        __metadata('design:type', String)
    ], Passwordless.prototype, "uid", void 0);
    __decorate([
        typeorm_1.Column('string', { type: 'string', nullable: false, default: '' }), 
        __metadata('design:type', String)
    ], Passwordless.prototype, "hashedToken", void 0);
    __decorate([
        typeorm_1.Column('text', { type: 'text', default: '' }), 
        __metadata('design:type', String)
    ], Passwordless.prototype, "originUrl", void 0);
    __decorate([
        typeorm_1.Column('bigint', { type: 'bigint', default: 0 }), 
        __metadata('design:type', Number)
    ], Passwordless.prototype, "ttl", void 0);
    Passwordless = __decorate([
        typeorm_1.Table(), 
        __metadata('design:paramtypes', [])
    ], Passwordless);
    return Passwordless;
}());
exports.Passwordless = Passwordless;
