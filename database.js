'use strict';
const promise = require('bluebird');
const initOptions = {
    promiseLib: promise,
    pgFormatting: true
};
const pgp = require('pg-promise')(initOptions);

const cn = {
    user: "",
    password: "",
    database: "",
    port: 5432,
    host: "",
    ssl: true
};
const db = pgp(cn);

exports.levelUp = function (id, exp) {
    db.any('select * from player inner join rank on player.rank_id = rank.rank_id where id =$1 and rank.rank_exp<=$2', [id, exp])
        .then(data => {
            if (data.length > 0) {
                db.none('UPDATE player SET rank_id = rank_id + 1 WHERE id=$1', [id]);
                db.none('UPDATE player SET exp = 0 WHERE id=$1', [id]);
                db.none('UPDATE player SET coin = coin + $1 WHERE id=$2',[data[0].rank_bonuscoin,id]);
            } else {
                db.none('UPDATE player SET exp = $1 WHERE id=$2', [exp, id]);
            }
        })
}
exports.loginWithFacebook = function (objectAuth, callback) {
    db.any('select * from facebookAuth where fid like $1', [objectAuth.fid])
        .then(data => {
            if (data.length == 0) {
                db.any('insert into facebookAuth values ($1,$2,$3,$4,$5);', [objectAuth.fid, objectAuth.name, objectAuth.accessToken, objectAuth.expiresIn, objectAuth.signedRequest])
                    .then(data => {
                        db.any('insert into player(exp,coin,name,rank_id,fid) values ($1,$2,$3,$4,$5);', [0, 10, objectAuth.name, 1, objectAuth.fid])
                            .then(data1 => {
                                db.any('select * from player inner join rank on player.rank_id = rank.rank_id where fid like $1 ', [objectAuth.fid])
                                    .then(data2 => {
                                        callback(data2);
                                    })
                            });
                    })
            } else {
                db.any('select * from player inner join rank on player.rank_id = rank.rank_id where fid like $1', [objectAuth.fid])
                    .then(data2 => {
                        callback(data2);
                    })
            };
        })
        .catch(error => {
            console.log('Check FBAuth Exist failed!:', error);
        });
}

exports.loginWithGoogle = function (objectAuth, callback) {
    db.any('select * from googleAuth where gid like $1', [objectAuth.gid])
        .then(data => {
            if (data.length == 0) {
                db.any('insert into googleAuth values ($1,$2,$3,$4,$5,$6,$7);', [objectAuth.gid, objectAuth.fullname, objectAuth.familyname, objectAuth.givenname, objectAuth.avatarurl, objectAuth.email, objectAuth.tokenid])
                    .then(data => {
                        db.any('insert into player(exp,coin,name,rank_id,gid) values ($1,$2,$3,$4,$5);', [0, 10, objectAuth.fullname, 1, objectAuth.gid])
                            .then(data1 => {
                                db.any('select * from player inner join rank on player.rank_id = rank.rank_id where gid like $1', [objectAuth.gid])
                                    .then(data2 => {
                                        callback(data2);
                                    })
                            });
                    })
            } else {
                db.any('select * from player inner join rank on player.rank_id = rank.rank_id where gid like $1', [objectAuth.gid])
                    .then(data2 => {
                        callback(data2);
                    })
            };
        })
        .catch(error => {
            console.log('Check GoogleAuth Exist failed!:', error);
        });
}
