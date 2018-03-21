'use strict';


const promise = require('bluebird'); // or any other Promise/A+ compatible library;
const initOptions = {
    promiseLib: promise, // overriding the default (ES6 Promise);
    pgFormatting: true
};

const pgp = require('pg-promise')(initOptions);

const cn = {
    user: "uttsqhcfymtqoi",
    password: "00a1af7b0448e626ed81d31d8c6fe18a57597db7737e7f208c976dbee155c919",
    database: "d8fab6qv9stk7m",
    port: 5432,
    host: "ec2-54-221-212-15.compute-1.amazonaws.com",
    ssl: true
};

const db = pgp(cn); // database instance;
exports.loginWithFacebook = function (objectAuth, callback) {
    //Check if FID is exist
    var isExist = false;
    var res = null;
    db.any('select * from facebookAuth where fid like $1', [objectAuth.fid])
        .then(data => {
            if (data.length > 0) {
                isExist = true;
            }
            if (!isExist) {
                db.any('insert into facebookAuth values ($1,$2,$3,$4,$5);', [objectAuth.fid, objectAuth.name, objectAuth.accessToken, objectAuth.expiresIn, objectAuth.signedRequest]).
                then(data => {
                    db.any('insert into player(exp,coin,name,rank_id,fid) values ($1,$2,$3,$4,$5);', [0, 10, objectAuth.name, 1, objectAuth.fid]).
                    then(data1 => {
                        db.any('select * from player where fid like $1', [objectAuth.fid])
                            .then(data2 => {
                                res = data2;
                                callback(res);
                            })
                    });
                })

            } else {
                db.any('select * from player where fid like $1', [objectAuth.fid])
                    .then(data2 => {
                        res = data2;
                        callback(res);
                    })
            };
        })
        .catch(error => {
            console.log('Check FBAuth Exist failed!:', error); // print the error;
        });


}
exports.loginWithGoogle = function (objectAuth, callback) {
    //Check if FID is exist
    var isExist = false;
    var res = null;
    db.any('select * from googleAuth where gid like $1', [objectAuth.gid])
        .then(data => {
            console.log(data);
            if (data.length > 0) {
                isExist = true;
            }
            if (!isExist) {
                db.any('insert into googleAuth values ($1,$2,$3,$4,$5,$6,$7);', [objectAuth.gid, objectAuth.fullname, objectAuth.familyname, objectAuth.givenname, objectAuth.avatarurl, objectAuth.email, objectAuth.tokenid]).
                then(data => {
                    db.any('insert into player(exp,coin,name,rank_id,gid) values ($1,$2,$3,$4,$5);', [0, 10, objectAuth.fullname, 1, objectAuth.gid]).
                    then(data1 => {
                        db.any('select * from player where gid like $1', [objectAuth.gid])
                            .then(data2 => {
                                res = data2;
                                callback(res);
                            })
                    });
                })

            } else {
                db.any('select * from player where gid like $1', [objectAuth.gid])
                    .then(data2 => {
                        res = data2;
                        callback(res);
                    })
            };
        })
        .catch(error => {
            console.log('Check FBAuth Exist failed!:', error); // print the error;
        });

}
// var obj = {
//     id: 28,
//     exp: 0,
//     coin: 10,
//     name: 'Đào Trọng Nghĩa',
//     rank_id: 1,
//     fid: null,
//     gid: '114396300798365667201',
//     description: null
// };
// this.loginWithGoogle(obj, function (res) {
//     console.log(res);
// });