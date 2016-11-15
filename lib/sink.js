"use strict";

const stream = require('readable-stream'),
      crypto = require('crypto'),
      assert = require('assert');




class SinkMem extends stream.Duplex {
    constructor(source, options) {
        super({
            readableObjectMode: false,
            writableObjectMode: false
        });
        this.options = options || {};
    }

    _write (chunk, encoding, next) {
        this.on('finish', () => {
            console.log('finished');
        });
        next();
    }

    _read (size) {

        this.push({});
    }
};

module.exports = SinkMem;



/*

const SinkMem = module.exports = function (fileDir) {
    if (!(this instanceof SinkMem)) return new SinkMem(fileDir);
    assert(fileDir, '"fileDir" must be provided');

    this.fileDir = fileDir;
};



SinkMem.prototype.tempName = function (fileType) {
    let rand = Math.floor(Math.random() * 1000).toString();
    return 'tmp-' + Date.now().toString() + '-' + rand + '.' + fileType;
}



SinkMem.prototype.writer = function (fileType, callback) {
    let temp = path.join(this.fileDir, this.tempName(fileType));
    let hash = crypto.createHash('sha1');

    let file = fs.createWriteStream(temp);
    file.on('finish', () => {
        let hashName = hash.digest('hex');
        fs.rename(temp, path.join(this.fileDir, hashName + '.' + fileType), () => {
            if (callback) {
                callback(hashName + '.' + fileType);
            }
        });
    });

    file.on('error', (error) => {
        console.log(error);
    });

    let hasher = new stream.Transform({
        transform: function (chunk, encoding, next) {
            hash.update(chunk, 'utf8');
            this.push(chunk);
            next();
        }
    });

    hasher.pipe(file);
    return hasher;
};



SinkMem.prototype.reader = function (fileName, callback) {
    let from = this.fileDir + fileName;
    let file = fs.createReadStream(from);

    file.on('finish', () => {
        if (callback) {
            callback();
        }
    });

    return file;
};

*/