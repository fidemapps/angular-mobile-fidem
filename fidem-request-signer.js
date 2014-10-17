'use strict';

var fidemRequestSigner = {};

// Inspiration and documentation
// http://docs.amazonwebservices.com/general/latest/gr/signature-version-4.html
// https://github.com/mhart/aws4

function hmac(key, string, encoding) {
    return AWS.util.crypto.hmac(key, string, encoding);
}

function hash(string, encoding) {
    return AWS.util.crypto.sha256(string, encoding);
}

function RequestSigner(request, credentials) {
    if (typeof request === 'string') {
        request = url.parse(request);
    }

    this.request = request;
    this.request.body = request.data ? JSON.stringify(request.data) : '';
    this.credentials = credentials;

    this.service = request.service || '';
    this.region = request.region || '';
}

RequestSigner.prototype.sign = function () {
    var request = this.request;
    var headers = request.headers || {};
    var date = new Date(headers.Date || new Date());

    this.datetime = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    this.date = this.datetime.substr(0, 8);

    if (!request.method && request.body)
        request.method = 'POST';

    if (!headers.Host && !headers.host)
        headers.Host = request.hostname || request.host;
    if (!request.hostname && !request.host)
        request.hostname = headers.Host || headers.host;

    if (request.body && !headers['Content-Type'] && !headers['content-type'])
        headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';

    if (request.body && !headers['Content-Length'] && !headers['content-length'])
        headers['Content-Length'] = request.body.length;

    headers['X-Fidem-Date'] = this.datetime;

    if (this.credentials.sessionToken) {
        headers['X-Fidem-Security-Token'] = this.credentials.sessionToken;
    }

    if (headers.Authorization) {
        delete headers.Authorization;
    }
    headers.Authorization = this.authHeader();

    return request;
};

RequestSigner.prototype.generateSignature = function () {
    var request = this.request;
    var headers = request.headers || {};
    var date = new Date(headers.Date || new Date());

    this.datetime = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    this.date = this.datetime.substr(0, 8);

    if (!request.method && request.body)
        request.method = 'POST';

    if (!headers.Host && !headers.host)
        headers.Host = request.hostname || request.host;
    if (!request.hostname && !request.host)
        request.hostname = headers.Host || headers.host;

    if (request.body && !headers['Content-Type'] && !headers['content-type'])
        headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';

    if (request.body && !headers['Content-Length'] && !headers['content-length'])
        headers['Content-Length'] = Buffer.byteLength(request.body);

    headers['X-Fidem-Date'] = this.datetime;

    if (this.credentials.sessionToken) {
        headers['X-Fidem-Security-Token'] = this.credentials.sessionToken;
    }

    if (headers.Authorization) {
        delete headers.Authorization;
    }

    return this.signature();
};

RequestSigner.prototype.authHeader = function () {
    return [
            'FIDEM4-HMAC-SHA256 Credential=' + this.credentials.accessKeyId + '/' + this.credentialString(),
            'SignedHeaders=' + this.signedHeaders(),
            'Signature=' + this.signature()
    ].join(', ');
};

RequestSigner.prototype.signature = function () {
    var kDate = hmac('FIDEM4' + this.credentials.secretAccessKey, this.date, 'buffer');
    var kRegion = hmac(kDate, this.region, 'buffer');
    var kService = hmac(kRegion, this.service, 'buffer');
    var kCredentials = hmac(kService, 'fidem4_request', 'buffer');
    return hmac(kCredentials, this.stringToSign(), 'hex');
};

RequestSigner.prototype.stringToSign = function () {
    return [
        'FIDEM4-HMAC-SHA256',
        this.datetime,
        this.credentialString(),
        hash(this.canonicalString(), 'hex')
    ].join('\n');
};

RequestSigner.prototype.canonicalString = function () {
    var pathParts = (this.request.path || '/').split('?', 2);
    return [
            this.request.method || 'GET',
            pathParts[0] || '/',
            pathParts[1] || '',
            this.canonicalHeaders() + '\n',
        this.signedHeaders(),
        hash(this.request.body || '', 'hex')
    ].join('\n');
};

RequestSigner.prototype.canonicalHeaders = function () {
    var headers = this.request.headers;

    function trimAll(header) {
        return header.toString().trim().replace(/\s+/g, ' ');
    }

    return Object.keys(headers)
        .sort(function (a, b) {
            return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
        })
        .map(function (key) {
            return key.toLowerCase() + ':' + trimAll(headers[key]);
        })
        .join('\n');
};

RequestSigner.prototype.signedHeaders = function () {
    return Object.keys(this.request.headers)
        .map(function (key) {
            return key.toLowerCase();
        })
        .sort()
        .join(';');
};

RequestSigner.prototype.credentialString = function () {
    return [
        this.date,
        this.region,
        this.service,
        'fidem4_request'
    ].join('/');
};

fidemRequestSigner.RequestSigner = RequestSigner;

fidemRequestSigner.sign = function (request, credentials) {
    return new RequestSigner(request, credentials).sign();
};

fidemRequestSigner.generateSignature = function (request, credentials) {
    return new RequestSigner(request, credentials).generateSignature();
};
