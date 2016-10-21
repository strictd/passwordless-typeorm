import { createConnection, ConnectionOptions, DriverOptions, getConnectionManager } from 'typeorm';
import { hash, compare } from 'bcrypt';
import { authenticate, storeOrUpdate, invalidateUser, clear, length } from
    'passwordless-tokenstore';
import { Passwordless } from './passwordless';

export class TypeORMStore {
  dbConn: string;

  constructor(dbDriver?: DriverOptions, dbConn?: string) {
    if (dbConn) {
      this.dbConn = dbConn;
    } else {
      createConnection({
        driver: dbDriver,
        entities: [Passwordless],
        autoSchemaSync: true
      }).then(() => { this.dbConn = 'default'; });
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
  public authenticate(token: string, uid: string, callback: (error: Error, valid: boolean, referrer: string) => void): void {
    if(!token || !uid || !callback) {
      throw new Error('TokenStore:authenticate called with invalid parameters');
    }
    if (!this.dbConn) { throw new Error('No Connection'); }

    let connection = getConnectionManager().get(this.dbConn);
    let repository = connection.getRepository(Passwordless);
    repository.createQueryBuilder("passwordless")
    .where("uid = :uid", {uid: uid})
    .where("ttl > :ttl", { ttl: new Date() })
    .getResults()
    .then((item: Passwordless[]) => {
      if(item.length) {
        compare(token, item[0].hashedToken, function(err, res) {
          if(err) {
            callback(err, false, null);
          } else if(res) {
            callback(null, true, item[0].originUrl || "");
          } else {
            callback(null, false, null);
          }
        });
      } else {
        callback(null, false, null);
      }
    }).catch((err: Error) => {
      callback(err, false, null);
    });
  }

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
  public storeOrUpdate(token: string, uid: string, msToLive: number, originUrl: string, callback: (err?: Error) => void): void {
    if(!token || !uid || !msToLive || !callback) {
      throw new Error('TokenStore:storeOrUpdate called with invalid parameters');
    }
    if (!this.dbConn) { throw new Error('No Connection'); }

    let connection = getConnectionManager().get(this.dbConn);
    let repository = connection.getRepository(Passwordless);
    hash(token, 10, (err, hashedToken) => {
      if (err) { return callback(err); }
      let newRecord = new Passwordless();
      newRecord.hashedToken = hashedToken;
      newRecord.uid = uid;
      newRecord.ttl = (new Date(Date.now() + msToLive).getTime() / 1000);
      newRecord.originUrl = originUrl || '';

      connection.entityManager.persist(newRecord).
        then(() => { callback(); }).
        catch((err: Error) => { callback(err); }); 
    });
  }

  /**
   * Invalidates and removes a user and the linked token
   * @param  {String}   user ID
   * @param  {Function} callback called with callback(error) in case of an
   * error or as callback() if the uid was successully invalidated
   */
  public invalidateUser(uid: string, callback: (err?: Error) => void): void {
    if(!uid || !callback) {
      throw new Error('TokenStore:invalidateUser called with invalid parameters');
    }
    if (!this.dbConn) { throw new Error('No Connection'); }
    
    let connection = getConnectionManager().get(this.dbConn);
    let repository = connection.getRepository(Passwordless);
    repository.findOne({uid: uid}).then((resp: any) =>
      repository.remove(resp).
        then(() => { callback(); }).
        catch((err: Error) => { callback(err); })
    )
  }

  /**
   * Removes and invalidates all token
   * @param  {Function} callback Called with callback(error) in case of an
   * error or as callback() if the token was successully stored / updated
   */
  public clear(callback: (err?: Error) => void): void {
    if(!callback) {
      throw new Error('TokenStore:clear called with invalid parameters');
    }
    if (!this.dbConn) { throw new Error('No Connection'); }

    let connection = getConnectionManager().get(this.dbConn);
    let repository = connection.getRepository(Passwordless);
    repository.find().then((resp: any) =>
      resp.remove().
        then(() => { callback(); }).
        catch((err: Error) => { callback(err); })
    );
  }

  /**
   * Number of tokens stored (no matter the validity)
   * @param  {Function} callback Called with callback(null, count) in case
   * of success or with callback(error) in case of an error
   */
  public length(callback: (err?: Error, count?: number) => void): void {
    if (!this.dbConn) { throw new Error('No Connection'); }

    let connection = getConnectionManager().get(this.dbConn);
    let repository = connection.getRepository(Passwordless);
    repository.find().then((res: Passwordless[]) => {
      callback(null, res.length);
    }).catch((err: Error) => { callback(err); });
  }
}
