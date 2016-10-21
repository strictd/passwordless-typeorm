"use strict";
var typeorm_1 = require('typeorm');
var bcrypt_1 = require('bcrypt');
var passwordless_1 = require('./passwordless');
var TypeORMStore = (function () {
    function TypeORMStore(dbDriver, dbConn) {
        var _this = this;
        if (dbConn) {
            this.dbConn = dbConn;
        }
        else {
            typeorm_1.createConnection({
                driver: dbDriver,
                entities: [passwordless_1.Passwordless],
                autoSchemaSync: true
            }).then(function () { _this.dbConn = 'default'; });
        }
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
    TypeORMStore.prototype.authenticate = function (token, uid, callback) {
        if (!token || !uid || !callback) {
            throw new Error('TokenStore:authenticate called with invalid parameters');
        }
        if (!this.dbConn) {
            throw new Error('No Connection');
        }
        var connection = typeorm_1.getConnectionManager().get(this.dbConn);
        var repository = connection.getRepository(passwordless_1.Passwordless);
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
    TypeORMStore.prototype.storeOrUpdate = function (token, uid, msToLive, originUrl, callback) {
        if (!token || !uid || !msToLive || !callback) {
            throw new Error('TokenStore:storeOrUpdate called with invalid parameters');
        }
        if (!this.dbConn) {
            throw new Error('No Connection');
        }
        var connection = typeorm_1.getConnectionManager().get(this.dbConn);
        var repository = connection.getRepository(passwordless_1.Passwordless);
        bcrypt_1.hash(token, 10, function (err, hashedToken) {
            if (err) {
                return callback(err);
            }
            var newRecord = new passwordless_1.Passwordless();
            newRecord.hashedToken = hashedToken;
            newRecord.uid = uid;
            newRecord.ttl = (new Date(Date.now() + msToLive).getTime() / 1000);
            newRecord.originUrl = originUrl || '';
            connection.entityManager.persist(newRecord).
                then(function () { callback(); }).
                catch(function (err) { callback(err); });
        });
    };
    /**
     * Invalidates and removes a user and the linked token
     * @param  {String}   user ID
     * @param  {Function} callback called with callback(error) in case of an
     * error or as callback() if the uid was successully invalidated
     */
    TypeORMStore.prototype.invalidateUser = function (uid, callback) {
        if (!uid || !callback) {
            throw new Error('TokenStore:invalidateUser called with invalid parameters');
        }
        if (!this.dbConn) {
            throw new Error('No Connection');
        }
        var connection = typeorm_1.getConnectionManager().get(this.dbConn);
        var repository = connection.getRepository(passwordless_1.Passwordless);
        repository.findOne({ uid: uid }).then(function (resp) {
            return repository.remove(resp).
                then(function () { callback(); }).
                catch(function (err) { callback(err); });
        });
    };
    /**
     * Removes and invalidates all token
     * @param  {Function} callback Called with callback(error) in case of an
     * error or as callback() if the token was successully stored / updated
     */
    TypeORMStore.prototype.clear = function (callback) {
        if (!callback) {
            throw new Error('TokenStore:clear called with invalid parameters');
        }
        if (!this.dbConn) {
            throw new Error('No Connection');
        }
        var connection = typeorm_1.getConnectionManager().get(this.dbConn);
        var repository = connection.getRepository(passwordless_1.Passwordless);
        repository.find().then(function (resp) {
            return resp.remove().
                then(function () { callback(); }).
                catch(function (err) { callback(err); });
        });
    };
    /**
     * Number of tokens stored (no matter the validity)
     * @param  {Function} callback Called with callback(null, count) in case
     * of success or with callback(error) in case of an error
     */
    TypeORMStore.prototype.length = function (callback) {
        if (!this.dbConn) {
            throw new Error('No Connection');
        }
        var connection = typeorm_1.getConnectionManager().get(this.dbConn);
        var repository = connection.getRepository(passwordless_1.Passwordless);
        repository.find().then(function (res) {
            callback(null, res.length);
        }).catch(function (err) { callback(err); });
    };
    return TypeORMStore;
}());
exports.TypeORMStore = TypeORMStore;
