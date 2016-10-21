"use strict";
var typeorm_1 = require('typeorm');
var bcrypt_1 = require('bcrypt');
var passwordless_typeorm_1 = require('./passwordless-typeorm');
var PasswordlessTypeORM = (function () {
    function PasswordlessTypeORM(dbDriver) {
        /* let dbDriver: DriverOptions = <DriverOptions>{ type: "mysql", host: "localhost", port: 3306, username: "root", password: "admin", database: "test"}; */
        typeorm_1.createConnection({
            driver: dbDriver,
            entities: [passwordless_typeorm_1.IPasswordlessTypeORM],
            autoSchemaSync: true
        });
    }
    /**
     * Checks if the provided token / user id combination exists and is
     * valid in terms of time-to-live. If yes, the method provides the
     * the stored referrer URL if any.
     * @param  {String}   token to be authenticated
     * @param  {String}   uid Unique identifier of an user
     * @param  {Function} callback in the format (error, valid, referrer).
     * In case of error, error will provide details, valid will be false and
     * referrer will be null. If the token / uid combination was not found
     * found, valid will be false and all else null. Otherwise, valid will
     * be true, referrer will (if provided when the token was stored) the
     * original URL requested and error will be null.
     */
    PasswordlessTypeORM.prototype.authenticate = function (token, uid, callback) {
        if (!token || !uid || !callback) {
            throw new Error('TokenStore:authenticate called with invalid parameters');
        }
        var connection = typeorm_1.getConnectionManager().get();
        var repository = connection.getRepository(passwordless_typeorm_1.IPasswordlessTypeORM);
        repository.createQueryBuilder("passwordless")
            .where("uid = :uid", { uid: uid })
            .where("ttl > :ttl", { ttl: new Date() })
            .getResults()
            .then(function (item) {
            if (item.length) {
                bcrypt_1.compare(token, item[0].hashedToken, function (err, res) {
                    if (err) {
                        callback(err, false, null);
                    }
                    else if (res) {
                        callback(null, true, item[0].originUrl || "");
                    }
                    else {
                        callback(null, false, null);
                    }
                });
            }
            else {
                callback(null, false, null);
            }
        }).catch(function (err) {
            callback(err, false, null);
        });
    };
    /**
     * Stores a new token / user ID combination or updates the token of an
     * existing user ID if that ID already exists. Hence, a user can only
     * have one valid token at a time
     * @param  {String}   token Token that allows authentication of _uid_
     * @param  {String}   uid Unique identifier of an user
     * @param  {Number}   msToLive Validity of the token in ms
     * @param  {String}   originUrl Originally requested URL or null
     * @param  {Function} callback Called with callback(error) in case of an
     * error or as callback() if the token was successully stored / updated
     */
    PasswordlessTypeORM.prototype.storeOrUpdate = function (token, uid, msToLive, originUrl, callback) {
        if (!token || !uid || !msToLive || !callback) {
            throw new Error('TokenStore:storeOrUpdate called with invalid parameters');
        }
        var connection = typeorm_1.getConnectionManager().get();
        var repository = connection.getRepository(passwordless_typeorm_1.IPasswordlessTypeORM);
        bcrypt_1.hash(token, 10, function (err, hashedToken) {
            if (err) {
                return callback(err);
            }
            var newRecord = new passwordless_typeorm_1.IPasswordlessTypeORM();
            newRecord.hashedToken = hashedToken;
            newRecord.uid = uid;
            newRecord.ttl = (new Date(Date.now() + msToLive).getTime() / 1000);
            newRecord.originUrl = originUrl;
            connection.entityManager.persist(newRecord).
                then(function () { return callback(); }).
                catch(function (err) { return callback(err); });
        });
    };
    /**
     * Invalidates and removes a user and the linked token
     * @param  {String}   user ID
     * @param  {Function} callback called with callback(error) in case of an
     * error or as callback() if the uid was successully invalidated
     */
    PasswordlessTypeORM.prototype.invalidateUser = function (uid, callback) {
        if (!uid || !callback) {
            throw new Error('TokenStore:invalidateUser called with invalid parameters');
        }
        var connection = typeorm_1.getConnectionManager().get();
        var repository = connection.getRepository(passwordless_typeorm_1.IPasswordlessTypeORM);
        repository.findOne({ uid: uid }).then(function (resp) {
            return repository.remove(resp).
                then(function () { return callback(); }).
                catch(function (err) { return callback(err); });
        });
    };
    /**
     * Removes and invalidates all token
     * @param  {Function} callback Called with callback(error) in case of an
     * error or as callback() if the token was successully stored / updated
     */
    PasswordlessTypeORM.prototype.clear = function (callback) {
        if (!callback) {
            throw new Error('TokenStore:clear called with invalid parameters');
        }
        var connection = typeorm_1.getConnectionManager().get();
        var repository = connection.getRepository(passwordless_typeorm_1.IPasswordlessTypeORM);
        repository.find().then(function (resp) {
            return resp.remove().
                then(function () { return callback(); }).
                catch(function (err) { return callback(err); });
        });
    };
    /**
     * Number of tokens stored (no matter the validity)
     * @param  {Function} callback Called with callback(null, count) in case
     * of success or with callback(error) in case of an error
     */
    PasswordlessTypeORM.prototype.length = function (callback) {
        var connection = typeorm_1.getConnectionManager().get();
        var repository = connection.getRepository(passwordless_typeorm_1.IPasswordlessTypeORM);
        repository.find().then(function (res) {
            callback(null, res.length);
        }).catch(function (err) { return callback(err); });
    };
    return PasswordlessTypeORM;
}());
exports.PasswordlessTypeORM = PasswordlessTypeORM;