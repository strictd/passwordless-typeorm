/// <reference types="node" />
import { DriverOptions } from 'typeorm';
export declare class TypeORMStore {
    dbConn: string;
    constructor(dbDriver?: DriverOptions, dbConn?: string);
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
    authenticate(token: string, uid: string, callback: (error: Error, valid: boolean, referrer: string) => void): void;
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
    storeOrUpdate(token: string, uid: string, msToLive: number, originUrl: string, callback: (err?: Error) => void): void;
    /**
     * Invalidates and removes a user and the linked token
     * @param  {String}   user ID
     * @param  {Function} callback called with callback(error) in case of an
     * error or as callback() if the uid was successully invalidated
     */
    invalidateUser(uid: string, callback: (err?: Error) => void): void;
    /**
     * Removes and invalidates all token
     * @param  {Function} callback Called with callback(error) in case of an
     * error or as callback() if the token was successully stored / updated
     */
    clear(callback: (err?: Error) => void): void;
    /**
     * Number of tokens stored (no matter the validity)
     * @param  {Function} callback Called with callback(null, count) in case
     * of success or with callback(error) in case of an error
     */
    length(callback: (err?: Error, count?: number) => void): void;
}
