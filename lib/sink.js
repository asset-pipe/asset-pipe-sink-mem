"use strict";

const stream = require('readable-stream');
const concat = require('concat-stream');
const crypto = require('crypto');



const SinkMem = module.exports = class SinkMem {
    constructor() {
        this.db = {};
    }


    writer (fileType, callback) {
        const hash = crypto.createHash('sha1');

        const file = concat((content) => {
            const name = hash.digest('hex') + '.' + fileType;
            this.db[name] = content;
            if (callback) {
                callback(name);
            }
        });

        const hasher = new stream.Transform({
            transform: function (chunk, encoding, next) {
                hash.update(chunk, 'utf8');
                this.push(chunk);
                next();
            }
        });

        hasher.pipe(file);
        return hasher;
    }


    reader (fileName, callback) {
        const self = this;

        const file = new stream.Readable({
            objectMode : false,
            read: function () {
                this.push(self.db[fileName]);
                this.push(null);
                if (callback) {
                    callback();
                }
            }
        });

        return file;
    }
};
