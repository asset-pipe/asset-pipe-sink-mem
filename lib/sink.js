'use strict';

const EventEmitter = require('events');
const JSONStream = require('JSONStream');
const common = require('asset-pipe-common');
const stream = require('readable-stream');
const concat = require('concat-stream');
const assert = require('assert');


class WriteStream extends stream.PassThrough {
    constructor (db, type) {
        super();

        const hasher = (type === 'json') ? new common.IdHasher() : new common.FileHasher();
        const parser = (type === 'json') ? JSONStream.parse('*') : new stream.PassThrough();

        const fillDB = concat((content) => {
            const id = hasher.hash;
            const file = `${id}.${type}`;
            db[file] = content;
            this.emit('file saved', id, file);
        });

        hasher.on('error', (error) => {
            this.emit('error', error);
        });

        parser.on('error', (error) => {
            this.emit('error', error);
        });

        this.pipe(parser).pipe(hasher);
        this.pipe(fillDB);
    }
}


class ReadStream extends stream.Readable {
    constructor (...args) {
        super(...args);
        this.db = args[0];
        this.file = args[1];

        if (this.db[this.file]) {
            setImmediate(() => {
                this.emit('file found');
            });
        } else {
            setImmediate(() => {
                this.emit('file not found', new Error('file not found'));
            });
        }
    }

    _read () {
        this.push(this.db[this.file]);
        this.push(null);
    }
}


module.exports = class SinkMem extends EventEmitter {
    constructor () {
        super();
        this.name = 'asset-pipe-sink-mem';
        this.db = {};
    }

    writer (type) {
        assert(type, '"type" is missing');
        return new WriteStream(this.db, type);
    }

    reader (file) {
        assert(file, '"file" is missing');
        return new ReadStream(this.db, file);
    }
};
