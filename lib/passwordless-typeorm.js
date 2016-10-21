"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var typeorm_1 = require('typeorm');
var IPasswordlessTypeORM = (function () {
    function IPasswordlessTypeORM() {
    }
    __decorate([
        typeorm_1.PrimaryColumn()
    ], IPasswordlessTypeORM.prototype, "uid", void 0);
    __decorate([
        typeorm_1.Column()
    ], IPasswordlessTypeORM.prototype, "hashedToken", void 0);
    __decorate([
        typeorm_1.Column()
    ], IPasswordlessTypeORM.prototype, "originUrl", void 0);
    __decorate([
        typeorm_1.Column()
    ], IPasswordlessTypeORM.prototype, "ttl", void 0);
    IPasswordlessTypeORM = __decorate([
        typeorm_1.Table()
    ], IPasswordlessTypeORM);
    return IPasswordlessTypeORM;
}());
exports.IPasswordlessTypeORM = IPasswordlessTypeORM;
