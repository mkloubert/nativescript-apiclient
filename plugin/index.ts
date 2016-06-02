// The MIT License (MIT)
// 
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

import Application = require("application");
import FileSystem = require("file-system"); 
import HTTP = require("http");
import Image = require("image-source");
import TypeUtils = require("utils/types");
import Xml = require("xml");


/**
 * A basic logger.
 */
export abstract class LoggerBase implements ILogger {
    /** @inheritdoc */
    public alert(msg : any, tag?: string, priority?: LogPriority) : LoggerBase {        
        return this.log(msg, tag,
                        LogCategory.Alert, priority);
    }
    
    /**
     * Creates a ILogMessage object.
     * 
     * @param any msg The message value.
     * @param {String} tag The tag value.
     * @param LogCategory category The log category.
     * @param {LogPriority} priority The log priority.
     */
    protected abstract createLogMessage(msg : any, tag: string,
                                        category: LogCategory, priority: LogPriority) : ILogMessage;
    
    /** @inheritdoc */
    public crit(msg : any, tag?: string, priority?: LogPriority) : LoggerBase {        
        return this.log(msg, tag,
                        LogCategory.Critical, priority);
    }
    
    /** @inheritdoc */
    public dbg(msg : any, tag?: string, priority?: LogPriority) : LoggerBase {        
        return this.log(msg, tag,
                        LogCategory.Debug, priority);
    }
    
    /** @inheritdoc */
    public emerg(msg : any, tag?: string, priority?: LogPriority) : LoggerBase {        
        return this.log(msg, tag,
                        LogCategory.Emergency, priority);
    }
    
    /** @inheritdoc */
    public err(msg : any, tag?: string, priority?: LogPriority) : LoggerBase {        
        return this.log(msg, tag,
                        LogCategory.Error, priority);
    }
    
    /** @inheritdoc */
    public info(msg : any, tag?: string, priority?: LogPriority) : LoggerBase {        
        return this.log(msg, tag,
                        LogCategory.Info, priority);
    }
    
    /** @inheritdoc */
    public log(msg : any, tag?: string,
               category?: LogCategory, priority?: LogPriority) : LoggerBase {
        
        if (isEmptyString(tag)) {
            tag = null;
        }
        else {
            tag = tag.toUpperCase().trim();
        }
        
        if (TypeUtils.isNullOrUndefined(category)) {
            category = LogCategory.Debug;
        }
        
        this.onLog(this.createLogMessage(msg, tag,
                                         category, priority));
        return this;    
    }
    
    /** @inheritdoc */
    public note(msg : any, tag?: string, priority?: LogPriority) : LoggerBase {        
        return this.log(msg, tag,
                        LogCategory.Notice, priority);
    }
    
    /**
     * The logic for the 'log' method.
     */
    protected abstract onLog(msg : ILogMessage);
    
    /** @inheritdoc */
    public trace(msg : any, tag?: string, priority?: LogPriority) : LoggerBase {        
        return this.log(msg, tag,
                        LogCategory.Trace, priority);
    }
    
    /** @inheritdoc */
    public warn(msg : any, tag?: string, priority?: LogPriority) : LoggerBase {        
        return this.log(msg, tag,
                        LogCategory.Warning, priority);
    }
}

/**
 * An authorizer that uses an internal list of
 * authorizers to execute.
 */
export class AggregateAuthorizer implements IAuthorizer {
    private _authorizers : IAuthorizer[] = [];
    
    /**
     * Adds one or more authorizers.
     * 
     * @param {IAuthorizer} ...authorizers One or more authorizers to add.
     */
    public addAuthorizers(...authorizers : IAuthorizer[]) {
        for (var i = 0; i < authorizers.length; i++) {
            this._authorizers
                .push(authorizers[i]);
        }
    }
    
    /** @inheritdoc */
    public prepare(reqOpts : HTTP.HttpRequestOptions) {
        for (var i = 0; i < this._authorizers.length; i++) {
            this._authorizers[i]
                .prepare(reqOpts);
        }
    }
}

class ApiClient extends LoggerBase implements IApiClient {
    constructor(cfg : IApiClientConfig) {
        super();
        
        // base URL
        if (!TypeUtils.isNullOrUndefined(cfg.baseUrl)) {
            this.baseUrl = cfg.baseUrl;
        }
        
        // route
        if (!TypeUtils.isNullOrUndefined(cfg.route)) {
            this.route = cfg.route;
        }
        
        // beforeSend()
        if (!TypeUtils.isNullOrUndefined(cfg.beforeSend)) {
            this.beforeSend(cfg.beforeSend);
        }
        
        // success action
        if (!TypeUtils.isNullOrUndefined(cfg.success)) {
            this.successAction = cfg.success;
        }
        
        // error action
        if (!TypeUtils.isNullOrUndefined(cfg.error)) {
            this.errorAction = cfg.error;
        }
        
        // complete action
        if (!TypeUtils.isNullOrUndefined(cfg.complete)) {
            this.completeAction = cfg.complete;
        }
        
        // notFound()
        if (!TypeUtils.isNullOrUndefined(cfg.notFound)) {
            this.notFound(cfg.notFound);
        }
        
        // unauthorized()
        if (!TypeUtils.isNullOrUndefined(cfg.unauthorized)) {
            this.unauthorized(cfg.unauthorized);
        }
        
        // forbidden()
        if (!TypeUtils.isNullOrUndefined(cfg.forbidden)) {
            this.forbidden(cfg.forbidden);
        }
        
        // succeededRequest()
        if (!TypeUtils.isNullOrUndefined(cfg.succeededRequest)) {
            this.succeededRequest(cfg.succeededRequest);
        }
        
        // redirection()
        if (!TypeUtils.isNullOrUndefined(cfg.redirection)) {
            this.redirection(cfg.redirection);
        }
        
        // clientError()
        if (!TypeUtils.isNullOrUndefined(cfg.clientError)) {
            this.clientError(cfg.clientError);
        }
        
        // serverError()
        if (!TypeUtils.isNullOrUndefined(cfg.serverError)) {
            this.serverError(cfg.serverError);
        }
        
        // ok()
        if (!TypeUtils.isNullOrUndefined(cfg.ok)) {
            this.ok(cfg.ok);
        }
        
        // status code
        for (var p in cfg) {
            var statusCode = parseInt(p);
            if (!isNaN(statusCode)) {
                if (statusCode >= 200 && statusCode <= 599) {
                    this.status(statusCode, cfg[p]);    
                }
            }
        }
        
        if (!TypeUtils.isNullOrUndefined(cfg.ifStatus)) {
            for (var i = 0; i < cfg.ifStatus.length; i++) {
                var ise = <IIfStatus>cfg.ifStatus[i];
                if (!TypeUtils.isNullOrUndefined(ise)) {
                    this.ifStatus(ise.predicate,
                                  ise.action);
                }
            }
        }
        
        if (!TypeUtils.isNullOrUndefined(cfg.if)) {
            for (var i = 0; i < cfg.if.length; i++) {
                var ie = <IIfResponse>cfg.if[i];
                
                this.if(ie.predicate,
                        ie.action);
            }
        }
    }
    
    public addLogger(logAction : (ctx : ILogMessage) => void) : ApiClient {
        if (!TypeUtils.isNullOrUndefined(logAction)) {
            this.logActions.push(logAction);
        }
        
        return this;
    }
    
    public badGateway(badGatewayAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(502, badGatewayAction);
    }
    
    public badRequest(badRequestAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(400, badRequestAction);
    }
    
    public baseUrl : string;
    
    public beforeSend(beforeAction : (opts : HTTP.HttpRequestOptions, tag: any) => void) : ApiClient {
        this.beforeSendActions.push(beforeAction);
        return this;
    }
    
    public beforeSendActions = [];
    
    public clientError(clientErrAction : (result : IApiClientResult) => void) : ApiClient {
        return this.ifStatus((code) => code >= 400 && code <= 499,
                             clientErrAction);
    }
    
    public complete(completeAction : (ctx : IApiClientCompleteContext) => void) : ApiClient {
        this.completeAction = completeAction;
        return this;
    }
    
    public completeAction : (ctx : IApiClientCompleteContext) => void;
    
    protected createLogMessage(msg: any, tag: string,
                               category : LogCategory, priority : LogPriority) : ILogMessage {
        
        return new LogMessage(LogSource.Client,
                              new Date(),
                              msg, tag,
                              category, priority);
    }
    
    public delete(opts? : IRequestOptions) {
        this.request("DELETE", opts);
    }
    
    public error(errAction : (ctx : IApiClientError) => void) : ApiClient {
        this.errorAction = errAction;
        return this;
    }
    
    public errorAction : (ctx : IApiClientError) => void;
    
    public forbidden(forbiddenAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(403, forbiddenAction);
    }
    
    public get(opts? : IRequestOptions) {
        return this.request("GET", opts);
    }
    
    public gone(goneAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(410, goneAction);
    }
    
    public if(predicate: (ctx : IApiClientResult) => boolean,
              statusAction : (result : IApiClientResult) => void) : ApiClient {
        
        this.ifEntries.push({
            action: statusAction,
            predicate: predicate,
        });
        return this; 
    }
    
    public ifEntries : IIfResponse[] = [];
    
    public ifStatus(predicate: (code : number) => boolean,
                    statusAction : (result : IApiClientResult) => void) : ApiClient {
        
        var ifPredicate : (ctx : IApiClientResult) => boolean;
        if (!TypeUtils.isNullOrUndefined(predicate)) {
            ifPredicate = function(ctx) : boolean {
                return predicate(ctx.code);
            };
        }
        else {
            ifPredicate = () => true;
        }

        return this.if(ifPredicate, statusAction);
    }

    public internalServerError(errAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(500, errAction);
    }
    
    public locked(lockedAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(423, lockedAction);
    }
    
    public logActions = [];
    
    public methodNotAllowed(notAllowedAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(405, notAllowedAction);
    }
    
    public notFound(notFoundAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(404, notFoundAction);
    }
    
    public notImplemented(notImplementedAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(501, notImplementedAction);
    }
    
    public ok(okAction : (result : IApiClientResult) => void) : ApiClient {
        this.status(200, okAction);
        this.status(204, okAction);
        this.status(205, okAction);
        
        return this;
    }
    
    protected onLog(msg : ILogMessage) {
        invokeLogActions(this, msg);
    }
    
    public patch(opts? : IRequestOptions) {
        return this.request("PATCH", opts);
    }
    
    public post(opts? : IRequestOptions) {
        return this.request("POST", opts);
    }
    
    public put(opts? : IRequestOptions) {
        return this.request("PUT", opts);
    }
    
    public redirection(redirectAction : (result : IApiClientResult) => void) : ApiClient {
        return this.ifStatus((code) => code >= 300 && code <= 399,
                             redirectAction);
    }

    public request(method : any, opts? : IRequestOptions) {
        var me = this;
        
        var convertToString = function(val: any) : string {
            if (TypeUtils.isNullOrUndefined(val)) {
                return null;
            }
            
            if (typeof val !== "string") {
                val = JSON.stringify(getOwnProperties(val));
            }
            
            return val;
        };
        
        var url = this.baseUrl;
        var route = me.route;
        if (!isEmptyString(route)) {
            if ("/" !== url.substring(url.length - 1)) {
                url += "/";
            }
            
            var routeParams : any;
            if (!TypeUtils.isNullOrUndefined(opts)) {
                var routeParamsTemp = getOwnProperties(opts.routeParams);
                if (!TypeUtils.isNullOrUndefined(routeParamsTemp)) {
                    routeParams = {};
                    
                    for (var rpt in routeParamsTemp) {
                        var routeParamName = rpt.toLowerCase().trim();
                        
                        if (routeParams[routeParamName] !== undefined) {
                            throw "Route parameter '" + routeParamName + "' is ALREADY defined!";
                        }
                        
                        routeParams[routeParamName] = routeParamsTemp[rpt];
                    }
                }
            }
            
            if (TypeUtils.isNullOrUndefined(routeParams)) {
                routeParams = {};
            }
            
            // parse route parameters
            route = route.replace(/{(([^\:]+))(\:)?([^}]*)}/g, function(match, paramName, formatSeparator, formatExpr) : string {
                paramName = paramName.toLowerCase().trim();
                
                var paramValue = routeParams[paramName];
                
                var funcDepth = -1;
                while (typeof paramValue === "function") {
                    paramValue = paramValue(paramName, routeParams, match, formatExpr, ++funcDepth);
                }
                
                if (paramValue === undefined) {
                    throw "Route parameter '" + paramName + "' is NOT defined!";
                }
                
                return convertToString(paramValue);
            });
            
            url += route;
        }

        var httpRequestOpts : any = {};
        httpRequestOpts.headers = {};
        
        var urlParams;
        
        if (!TypeUtils.isNullOrUndefined(opts)) {
            // request headers
            var requestHeaders = getOwnProperties(opts.headers);
            if (!TypeUtils.isNullOrUndefined(requestHeaders)) {
                httpRequestOpts.headers = requestHeaders;
            }
            
            // timeout
            if (!TypeUtils.isNullOrUndefined(opts.timeout)) {
                httpRequestOpts.timeout = opts.timeout;
            }
            
            // URL parameters
            urlParams = getOwnProperties(opts.params);
            if (!TypeUtils.isNullOrUndefined(urlParams)) {
                var i = 0;
                var urlParamSuffix = "";
                for (var up in urlParams) {
                    if (i > 0) {
                        urlParamSuffix += "&";
                    }

                    urlParamSuffix += up + "=" + urlParams[up];
                    ++i;
                }
                
                if (i > 0) {
                    url += "?" + urlParamSuffix;
                }
            }
        }
        
        if (TypeUtils.isNullOrUndefined(httpRequestOpts.headers)) {
            httpRequestOpts.headers = {};
        }
        
        var content;
        var encoding = "utf-8";
        
        var contentConverter = (c) => c;
        
        if (!TypeUtils.isNullOrUndefined(opts)) {
            content = opts.content;
            
            // encoding
            if (!isEmptyString(opts.encoding)) {
                encoding = opts.encoding.toLowerCase().trim();
            }
            
            // request type
            if (!TypeUtils.isNullOrUndefined(opts.type)) {
                switch (opts.type) {
                    case HttpRequestType.Binary:
                        httpRequestOpts.headers["Content-type"] = "application/octet-stream";
                        break;
                        
                    case HttpRequestType.JSON:
                        httpRequestOpts.headers["Content-type"] = "application/json; charset=" + encoding;
                        contentConverter = function(c) {
                            if (null !== c) {
                                c = JSON.stringify(c);  
                            }
                            
                            return c; 
                        };
                        break;
                        
                    case HttpRequestType.Text:
                        httpRequestOpts.headers["Content-type"] = "text/plain; charset=" + encoding;
                        contentConverter = function(c) {
                            return convertToString(c); 
                        };
                        break;
                        
                    case HttpRequestType.Xml:
                        httpRequestOpts.headers["Content-type"] = "text/xml; charset=" + encoding;
                        contentConverter = function(c) {                            
                            c = convertToString(c);
                            if (null !== c) {
                                var isValidXml = true;
                                var xmlParser = new Xml.XmlParser(() => {}, function(error: Error) {
                                    isValidXml = false;
                                });
                                
                                xmlParser.parse(c);
                                
                                if (!isValidXml) {
                                    throw "XML parse error.";
                                }
                            }
                            
                            return c; 
                        };
                        break;
                }
            }
            
            // authorization
            if (!TypeUtils.isNullOrUndefined(opts.authorizer)) {
                opts.authorizer
                    .prepare(httpRequestOpts);
            }
        }

        
        if (TypeUtils.isNullOrUndefined(content)) {
            content = null;
        }
        
        httpRequestOpts.url = encodeURI(url);
        httpRequestOpts.method = methodToString(method);
        httpRequestOpts.content = contentConverter(content);
        
        // before send actions
        for (var i = 0; i < me.beforeSendActions.length; i++) {
            var bsa = me.beforeSendActions[i];
            bsa(httpRequestOpts, opts.tag);
        }
        
        var httpReq = new HttpRequest(me, httpRequestOpts);
        
        me.dbg("URL: " + httpRequestOpts.url, "HttpRequestOptions");
        me.dbg("Method: " + httpRequestOpts.method, "HttpRequestOptions");

        for (var rp in routeParams) {
            me.dbg("RouteParameter[" + rp + "]: " + routeParams[rp], "HttpRequestOptions");
        }
        
        if (!TypeUtils.isNullOrUndefined(urlParams)) {
            for (var up in urlParams) {
                me.dbg("UrlParameter[" + up + "]: " + urlParams[rp], "HttpRequestOptions");
            }
        }

        var getLogTag = function() : string {
            return "HttpRequest::" + httpRequestOpts.url;
        };
        
        var invokeComplete = function(result: ApiClientResult, err: ApiClientError) {
            if (!TypeUtils.isNullOrUndefined(result)) {
                result.setContext(ApiClientResultContext.Complete);
            }
            
            if (!TypeUtils.isNullOrUndefined(me.completeAction)) {
                me.completeAction(new ApiClientCompleteContext(me, httpReq,
                                                               result, err,
                                                               opts.tag));
            }
        };

        try {
            HTTP.request(httpRequestOpts)
                .then(function (response) {
                          var result = new ApiClientResult(me, httpReq, response,
                                                           opts.tag);
                          result.setContext(ApiClientResultContext.Success);

                          me.dbg("Status code: " + result.code, getLogTag());

                          for (var h in getOwnProperties(result.headers)) {
                              me.trace("ResponseHeader['" + h + "']: " + result.headers[h], getLogTag());
                          }

                          // collect "conditional" actions that should be
                          // invoked instead of "success" action
                          var ifActions = [];
                          for (var i = 0; i < me.ifEntries.length; i++) {
                              var ie = me.ifEntries[i];
                            
                              if (!TypeUtils.isNullOrUndefined(ie.action)) {
                                  var statusPredicate = ie.predicate;
                                  if (TypeUtils.isNullOrUndefined(statusPredicate)) {
                                      statusPredicate = () => true;
                                  }
                                
                                  if (statusPredicate(result)) {
                                      ifActions.push(ie.action);
                                  }
                              }
                          }
                        
                          // process "conditional" actions
                          for (var i = 0; i < ifActions.length; i++) {
                              var ia = ifActions[i];
                              ia(result);
                          }

                          if (ifActions.length < 1 &&
                              !TypeUtils.isNullOrUndefined(me.successAction)) {
                            
                              me.successAction(result);
                          }
                        
                          invokeComplete(undefined, errCtx);
                      },
                      function (err) {
                          me.err("[ERROR]: " + err, getLogTag());
                          
                          var errCtx = new ApiClientError(me, httpReq,
                                                          err, ApiClientErrorContext.ClientError,
                                                          opts.tag);
                        
                          if (!TypeUtils.isNullOrUndefined(me.errorAction)) {
                              errCtx.handled = true;
                              me.errorAction(errCtx);
                          }
                        
                          if (!errCtx.handled) {
                              throw err;
                          }
                          
                          invokeComplete(undefined, errCtx);
                      });
        }
        catch (e) {
            me.crit("[FATAL ERROR]: " + e, getLogTag());
            
            var errCtx = new ApiClientError(me, httpReq,
                                            e, ApiClientErrorContext.Exception,
                                            opts.tag);
            
            if (!TypeUtils.isNullOrUndefined(me.errorAction)) {
                errCtx.handled = true;
                me.errorAction(errCtx);     
            }
            
            if (!errCtx.handled) {
                throw e;
            }
            
            invokeComplete(undefined, errCtx);
        }
    }
    
    public route : string;
    
    public serverError(serverErrAction : (result : IApiClientResult) => void): ApiClient {
        return this.ifStatus((code) => code >= 500 && code <= 599,
                             serverErrAction);
    }

    public serviceUnavailable(unavailableAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(503, unavailableAction);
    }
    
    public setBaseUrl(newValue: string) : ApiClient {
        this.baseUrl = newValue;
        return this;
    }
    
    public setRoute(newValue : string) : ApiClient {
        this.route = newValue;
        return this;
    }
    
    public status(code: number, statusAction : (result : IApiClientResult) => void) : ApiClient {
        this.ifStatus((sc) => code == sc,
                      statusAction);
        return this;
    }

    public succeededRequest(succeededAction : (result : IApiClientResult) => void): ApiClient {
        return this.ifStatus((code) => code >= 200 && code <= 299,
                             succeededAction);
    }

    public success(successAction: (result : IApiClientResult) => void) : ApiClient {
        this.successAction = successAction;
        return this;
    }
    
    public successAction: (ctx : IApiClientResult) => void;
    
    public tooManyRequests(tooManyAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(429, tooManyAction);
    }
    
    public unauthorized(unauthorizedAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(401, unauthorizedAction);
    }
    
    public unsupportedMediaType(unsupportedAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(415, unsupportedAction);
    }
    
    public uriTooLong(tooLongAction : (result : IApiClientResult) => void) : ApiClient {
        return this.status(414, tooLongAction);
    }
}

class ApiClientCompleteContext extends LoggerBase implements IApiClientCompleteContext {    
    private _client: ApiClient;
    private _error: ApiClientError;
    private _request: HttpRequest;
    private _result: ApiClientResult;
    private _tag: any;
    
    constructor(client: ApiClient, request: HttpRequest, result: ApiClientResult, err: ApiClientError,
                tag: any) {
                    
        super();
        
        this._client = client;
        this._request = request;
        this._result = result;
        this._error = err;
        this._tag = tag;
    }
    
    public get client() : ApiClient {
        return this._client;
    }
    
    protected createLogMessage(msg: any, tag: string,
                               category : LogCategory, priority : LogPriority) : ILogMessage {
        
        return new LogMessage(LogSource.Complete,
                              new Date(),
                              msg, tag,
                              category, priority);
    }
    
    public get error(): ApiClientError {
        return this._error;
    }
    
    protected onLog(msg: ILogMessage) {
        invokeLogActions(this._client, msg);
    }
    
    public get request(): HttpRequest {
        return this._request;
    }
    
    public get result(): ApiClientResult {
        return this._result;
    }
    
    public get tag(): any {
        return this._tag;
    }
}

class ApiClientError extends LoggerBase implements IApiClientError {
    private _client: ApiClient;
    private _context: ApiClientErrorContext;
    private _error: any;
    private _request: HttpRequest;
    private _tag: any;
    
    constructor(client : ApiClient, request: HttpRequest, error: any, ctx: ApiClientErrorContext,
                tag: any) {
        super();
        
        this._client = client;
        this._request = request;
        this._error = error;
        this._context = ctx;
        this._tag = tag;
    }
    
    public get client(): IApiClient {
        return this._client;
    }
    
    public get context() : ApiClientErrorContext {
        return this._context;
    }
    
    protected createLogMessage(msg: any, tag: string,
                               category : LogCategory, priority : LogPriority) : ILogMessage {
        
        return new LogMessage(LogSource.Error,
                              new Date(),
                              msg, tag,
                              category, priority);
    }
    
    public get error() : any {
        return this._error;
    }
    
    public handled: boolean = false;
    
    protected onLog(msg : ILogMessage) {
        invokeLogActions(this._client, msg);
    }
    
    public get request() : HttpRequest {
        return this._request;
    }
    
    public get tag() : any {
        return this._tag;
    }
}

/**
 * List of API client result contextes.
 */
export enum ApiClientResultContext {
    /**
     * "success" action.
     */
    Success,
    
    /**
     * "completed" action.
     */
    Complete
}

/**
 * List of API client error contextes.
 */
export enum ApiClientErrorContext {
    /**
     * Error in HTTP client.
     */
    ClientError,
    
    /**
     * "Unhandled" exception.
     */
    Exception
}

class ApiClientResult extends LoggerBase implements IApiClientResult {
    private _client: ApiClient;
    private _context: ApiClientResultContext;
    private _reponse: HTTP.HttpResponse;
    private _request: HttpRequest;
    private _tag: any;
    
    constructor(client : ApiClient, request: HttpRequest, response: HTTP.HttpResponse,
                tag: any) {
        super();
        
        this._client = client;
        this._request = request;
        this._reponse = response;
        this._tag = tag;
    }
    
    public get client() : ApiClient {
        return this._client;
    }
    
    public get code(): number {
        return this._reponse.statusCode;
    }
    
    public get content() : any {
        if (TypeUtils.isNullOrUndefined(this._reponse.content.raw)) {
            return null;
        }
        
        return this._reponse.content.raw;
    }
    
    public get context() : ApiClientResultContext {
        return this._context;
    }
    
    protected createLogMessage(msg: any, tag: string,
                               category : LogCategory, priority : LogPriority) : ILogMessage {
        
        return new LogMessage(LogSource.Result,
                              new Date(),
                              msg, tag,
                              category, priority);
    }

    public getAjaxResult<TData>() : IAjaxResult<TData> {
        return this.getJSON<IAjaxResult<TData>>();
    }
    
    public getFile(destFile?: string) : FileSystem.File {
        if (arguments.length < 1) {
            return this._reponse.content.toFile();
        }
        
        this._reponse.headers
        
        return this._reponse.content.toFile(destFile);
    }
    
    public getImage(): Promise<Image.ImageSource> {
        return this._reponse.content.toImage();
    }
    
    public getJSON<T>() : T {
        var json = this._reponse.content.toString();
        if (isEmptyString(json)) {
            return null;
        }
        
        return JSON.parse(json);
    }
    
    public getString() : string {
        var str = this._reponse.content.toString();
        if (TypeUtils.isNullOrUndefined(str)) {
            return null;
        }
        
        return str;
    }
    
    public get headers(): HTTP.Headers {
        return this._reponse.headers;
    }
    
    protected onLog(msg : ILogMessage) {
        invokeLogActions(this._client, msg);
    }
    
    public get request() : HttpRequest {
        return this._request;
    }
    
    public get response() : HTTP.HttpResponse {
        return this._reponse;
    }
    
    public setContext(newValue : ApiClientResultContext) {
        this._context = newValue;
    }
    
    public get tag() : any {
        return this._tag;
    }
}

/**
 * An authorizer for basic authentication.
 */
export class BasicAuth implements IAuthorizer {
    private _password : string;
    private _username : string;
    
    /**
     * Initializes a new instance of that class.
     * 
     * @param {String} username The username.
     * @param {String} pwd The password.
     */
    constructor(username : string, pwd : string) {
        this._username = username;
        this._password = pwd;
    }
    
    /**
     * Gets the password.
     * 
     * @property
     */
    public get password() : string {
        return this._password;
    }
    
    /** @inheritdoc */
    public prepare(reqOpts : HTTP.HttpRequestOptions) {
        reqOpts.headers["Authorization"] = "Basic " + btoa(this._username + ":" + this._password);
    }
    
    /**
     * Gets the username.
     * 
     * @property
     */
    public get username() : string {
        return this._username;
    }
}

/**
 * An authorizer for bearer authentication.
 */
export class BearerAuth implements IAuthorizer {
    private _token : string;
    
    /**
     * Initializes a new instance of that class.
     * 
     * @param {String} token The token.
     */
    constructor(token : string) {
        this._token = token;
    }
    
    /** @inheritdoc */
    public prepare(reqOpts : HTTP.HttpRequestOptions) {
        reqOpts.headers["Authorization"] = "Bearer " + this._token;
    }
    
    /**
     * Gets the token.
     * 
     * @property
     */
    public get token() : string {
        return this._token;
    }
}

/**
 * List of known HTTP request methods.
 */
export enum HttpMethod {
    GET,
    POST, 
    PUT,
    PATCH,   
    DELETE,
    HEAD,
    TRACE,
    OPTIONS,
    CONNECT
}

class HttpRequest implements IHttpRequest {
    private _client: ApiClient;
    private _opts: HTTP.HttpRequestOptions;
    
    constructor(client: ApiClient, reqOpts : HTTP.HttpRequestOptions) {
        this._client = client;
        this._opts = reqOpts;
    }
    
    public get body() : any {
        return this._opts.content;
    }
    
    public get client() : ApiClient {
        return this._client;
    }
    
    public get headers(): any {
        return this._opts.headers;
    }
    
    public get method(): string {
        return this._opts.method;
    }
    
    public get url(): string {
        return this._opts.url;
    }
}

/**
 * List of known HTTP request / content types.
 */
export enum HttpRequestType {
    /**
     * Raw / binary
     */
    Binary,
    
    /**
     * JSON
     */
    JSON,
    
    /**
     * Xml
     */
    Xml,
    
    /**
     * Text / string
     */
    Text
}

/**
 * List of known HTTP status codes.
 */
export enum HttpStatusCode {
    Accepted = 202,
    BadGateway = 502,
    BadRequest = 400,
    Conflict = 409,
    Continue = 100,
    Created = 201,
    ExpectationFailed = 417,
    Forbidden = 403,
    GatewayTimeout = 504,
    Gone = 410,
    HttpVersionNotSupported = 505,
    InternalServerError = 500,
    LengthRequired = 411,
    MethodNotAllowed = 405,
    MovedPermanently = 301,
    MultipleChoices = 300,
    NoContent = 204,
    NonAuthoritativeInformation = 203,
    NotAcceptable = 406,
    NotFound = 404,
    NotImplemented = 501,
    NotModified = 304,
    OK = 200,
    PartialContent = 206,
    PaymentRequired = 402,
    PreconditionFailed = 412,
    ProxyAuthenticationRequired = 407,
    Redirect = 302,
    RequestedRangeNotSatisfiable = 416,
    RequestEntityTooLarge = 413,
    RequestTimeout = 408,
    RequestUriTooLong = 414,
    ResetContent = 205,
    SeeOther = 303,
    ServiceUnavailable = 503,
    SwitchingProtocols = 101,
    TemporaryRedirect = 307,
    Unauthorized = 401,
    UnsupportedMediaType = 415,
    Unused = 306,
    UpgradeRequired = 426,
    UseProxy = 305,
}

/**
 * A helper object for wrapping API results.
 */
export interface IAjaxResult<TData> {
    /**
     * Gets the code (if defined).
     * 
     * @property
     */
    code? : number;
    
    /**
     * Gets the message (if defined).
     * 
     * @property
     */
    msg?: string;
    
    /**
     * The the result data (if defined).
     * 
     * @property
     */
    data?: TData;
}

/**
 * Describes an API client.
 */
export interface IApiClient {
    /**
     * Adds a log action.
     * 
     * @chainable
     * 
     * @param {Function} logAction The log action.
     */
    addLogger(logAction : (ctx : ILogMessage) => void) : IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 502 (bad gateway).
     * 
     * @chainable
     * 
     * @param {Function} badGatewayAction The action to invoke.
     */
    badGateway(badGatewayAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 400 (bad request).
     * 
     * @chainable
     * 
     * @param {Function} notFoundAction The action to invoke.
     */
    badRequest(badRequestAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Gets or sets the base URL.
     */
    baseUrl : string;
    
    /**
     * Defines an action that is invoked BEFORE a request starts.
     * 
     * @chainable
     * 
     * @param {Function} beforeAction The action to invoke.
     */
    beforeSend(beforeAction : (opts : HTTP.HttpRequestOptions) => void) : IApiClient;
    
    /**
     * Defines an action that is invoked on a status code between 400 and 499.
     * 
     * @chainable
     * 
     * @param {Function} clientErrAction The action to invoke.
     */
    clientError(clientErrAction : (result : IApiClientResult) => void): IApiClient;
    
    /**
     * Defines the "complete" action.
     * 
     * @chainable
     * 
     * @param {Function} completeAction The action to invoke.
     */
    complete(completeAction : (ctx : IApiClientCompleteContext) => void) : IApiClient;
    
    /**
     * Starts a DELETE request.
     * 
     * @param {IRequestOptions} [opts] The (additional) options.
     */
    delete(opts? : IRequestOptions);
    
    /**
     * Defines the "error" action.
     * 
     * @chainable
     * 
     * @param {Function} errAction The action to invoke.
     */
    error(errAction : (ctx : IApiClientError) => void) : IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 403 (forbidden).
     * 
     * @chainable
     * 
     * @param {Function} forbiddenAction The action to invoke.
     */
    forbidden(forbiddenAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Starts a GET request.
     * 
     * @param {IRequestOptions} [opts] The (additional) options.
     */
    get(opts? : IRequestOptions);
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 410 (gone).
     * 
     * @chainable
     * 
     * @param {Function} goneAction The action to invoke.
     */
    gone(goneAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Invokes an action if a predicate matches.
     * 
     * @chainable
     * 
     * @param {Function} predicate The predicate to use.
     * @param {Function} statusAction The action to invoke.
     */
    if(predicate: (ctx : IApiClientResult) => boolean,
       statusAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Invokes an action if a status matches.
     * 
     * @chainable
     * 
     * @param {Function} predicate The predicate to use.
     * @param {Function} statusAction The action to invoke.
     */
    ifStatus(predicate: (code : number) => boolean,
             statusAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 500 (internal server error).
     * 
     * @chainable
     * 
     * @param {Function} errAction The action to invoke.
     */
    internalServerError(errAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 423 (document not found).
     * 
     * @chainable
     * 
     * @param {Function} lockedAction The action to invoke.
     */
    locked(lockedAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 405 (method not allowed).
     * 
     * @chainable
     * 
     * @param {Function} notAllowedAction The action to invoke.
     */
    methodNotAllowed(notAllowedAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 404 (document not found).
     * 
     * @chainable
     * 
     * @param {Function} notFoundAction The action to invoke.
     */
    notFound(notFoundAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 501 (not implemented).
     * 
     * @chainable
     * 
     * @param {Function} notImplementedAction The action to invoke.
     */
    notImplemented(notImplementedAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 200, 204 or 205 (OK; no content; reset content).
     * 
     * @chainable
     * 
     * @param {Function} okAction The action to invoke.
     */
    ok(okAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Starts a PATCH request.
     * 
     * @param {IRequestOptions} [opts] The (additional) options.
     */
    patch(opts? : IRequestOptions);
    
    /**
     * Starts a POST request.
     * 
     * @param {IRequestOptions} [opts] The (additional) options.
     */
    post(opts? : IRequestOptions);
    
    /**
     * Starts a PUT request.
     * 
     * @param {IRequestOptions} [opts] The (additional) options.
     */
    put(opts? : IRequestOptions);
    
    /**
     * Defines an action that is invoked on a status code between 300 and 399.
     * 
     * @chainable
     * 
     * @param {Function} redirectAction The action to invoke.
     */
    redirection(redirectAction : (result : IApiClientResult) => void): IApiClient;
    
    /**
     * Starts a request.
     * 
     * @param any method The HTTP method.
     * @param {IRequestOptions} [opts] The (additional) options.
     */
    request(method : any, opts? : IRequestOptions);
    
    /**
     * Gets or sets the route.
     */
    route : string;
    
    /**
     * Defines an action that is invoked on a status code between 500 and 599.
     * 
     * @chainable
     * 
     * @param {Function} serverErrAction The action to invoke.
     */
    serverError(serverErrAction : (result : IApiClientResult) => void): IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 503 (service unavailable).
     * 
     * @chainable
     * 
     * @param {Function} unavailableAction The action to invoke.
     */
    serviceUnavailable(unavailableAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Sets the base URL.
     * 
     * @chainable
     * 
     * @param {String} newValue The new URL.
     */        
    setBaseUrl(newValue : string) : IApiClient;
    
    /**
     * Sets the route.
     * 
     * @chainable
     * 
     * @param {String} newValue The new route.
     */
    setRoute(newValue : string) : IApiClient;
    
    /**
     * Defines an action that is invoked for a specific status code.
     * 
     * @chainable
     * 
     * @param {Number} code The status code.
     * @param {Function} statusAction The action to invoke.
     */
    status(code: number,
           statusAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Defines an action that is invoked on a status code between 200 and 299.
     * 
     * @chainable
     * 
     * @param {Function} succeededAction The action to invoke.
     */
    succeededRequest(succeededAction : (result : IApiClientResult) => void): IApiClient;
    
    /**
     * Defines the "success" action.
     * 
     * @chainable
     * 
     * @param {Function} successAction The action to invoke.
     */
    success(successAction : (result: IApiClientResult) => void) : IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 429 (too many requests).
     * 
     * @chainable
     * 
     * @param {Function} tooManyAction The action to invoke.
     */
    tooManyRequests(tooManyAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 401 (unauthorized).
     * 
     * @chainable
     * 
     * @param {Function} unauthorizedAction The action to invoke.
     */
    unauthorized(unauthorizedAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 415 (unsupported media type).
     * 
     * @chainable
     * 
     * @param {Function} unsupportedAction The action to invoke.
     */
    unsupportedMediaType(unsupportedAction : (result : IApiClientResult) => void) : IApiClient;
    
    /**
     * Short hand method to define an action that is invoked
     * for a status code 414 (URI too long).
     * 
     * @chainable
     * 
     * @param {Function} tooLongAction The action to invoke.
     */
    uriTooLong(tooLongAction : (result : IApiClientResult) => void) : IApiClient;
}

/**
 * Describes a context of a "complete" action.
 */
export interface IApiClientCompleteContext extends ILogger, ITagProvider {
    /**
     * Gets the underlying API client.
     * 
     * @property
     */
    client: IApiClient;
    
    /**
     * Gets the error context (if defined).
     * 
     * @property
     */
    error?: IApiClientError;
    
    /**
     * Gets the underlying HTTP request.
     * 
     * @property
     */
    request: IHttpRequest;
    
    /**
     * Gets the API result (if defined).
     * 
     * @property
     */
    result?: IApiClientResult;
}

/**
 * Describes an object that stores configuration data for an API client.
 */
export interface IApiClientConfig {
    /**
     * Gets the base URL to use.
     * 
     * @property
     */
    baseUrl: string;
    
    /**
     * Defines an action that is invoked BEFORE a request starts.
     * 
     * @property
     */
    beforeSend? : (opts : HTTP.HttpRequestOptions) => void;
    
    /**
     * Defines the action to handle a status code between 400 and 499.
     * 
     * @property
     */
    clientError?: (ctx : IApiClientResult) => void;
    
    /**
     * Defines the "complete" action.
     * 
     * @property
     */
    complete?: (ctx : IApiClientCompleteContext) => void;
    
    /**
     * Defines the "error" action.
     * 
     * @property
     */
    error?: (ctx : IApiClientError) => void;
    
    /**
     * Defines the action to handle a 403 status code.
     * 
     * @property
     */
    forbidden?: (ctx : IApiClientResult) => void;
    
    /**
     * Defines that actions to invoke if a reponse matches.
     */
    if? : IIfResponse[];
    
    /**
     * Defines that actions to invoke if a status code matches.
     */
    ifStatus? : IIfStatus[];
    
    /**
     * Defines the action to handle a status code between 300 and 399.
     * 
     * @property
     */
    redirection?: (ctx : IApiClientResult) => void;
    
    /**
     * Defines the action to handle a 404 status code.
     * 
     * @property
     */
    notFound?: (ctx : IApiClientResult) => void;
    
    /**
     * Defines the action to handle a 200, 204 or 205 status code.
     * 
     * @property
     */
    ok?: (ctx : IApiClientResult) => void;
    
    /**
     * Gets the optional route.
     * 
     * @property
     */
    route?: string;
    
    /**
     * Defines the action to handle a status code between 500 and 599.
     * 
     * @property
     */
    serverError?: (ctx : IApiClientResult) => void;

    /**
     * Defines the action to handle a status code between 200 and 299.
     * 
     * @property
     */
    succeededRequest?: (ctx : IApiClientResult) => void;
    
    /**
     * Defines the "success" action.
     * 
     * @property
     */
    success?: (ctx : IApiClientResult) => void;
    
    /**
     * Defines the action to handle a 401 status code.
     * 
     * @property
     */
    unauthorized?: (ctx : IApiClientResult) => void;
}

/**
 * Describes an error context of an API call.
 */
export interface IApiClientError extends ILogger, ITagProvider {
    /**
     * Gets the underlying client.
     * 
     * @property
     */
    client: IApiClient;
    
    /**
     * Gets the context.
     * 
     * @property
     */
    context: ApiClientErrorContext;
    
    /**
     * Gets the error data.
     * 
     * @property
     */
    error: any;
    
    /**
     * Gets or sets if error has been handled or not.
     * 
     * @property
     */
    handled: boolean;
    
    /**
     * Gets the underlying HTTP request.
     * 
     * @property
     */
    request: IHttpRequest;
}

/**
 * Describes an API result.
 */
export interface IApiClientResult extends ILogger, ITagProvider {
    /**
     * Gets the underlying API client.
     * 
     * @property
     */
    client: IApiClient;

    /**
     * Gets the HTTP response code.
     * 
     * @property
     */
    code: number;
    
    /**
     * Gets the raw content.
     * 
     * @property
     */
    content: any;
    
    /**
     * Gets the underlying (execution) context.
     * 
     * @property
     */
    context: ApiClientResultContext;
    
    /**
     * Gets the response headers.
     * 
     * @property
     */
    headers: HTTP.Headers;
    
    /**
     * Returns the content as wrapped AJAX result object.
     * 
     * @return {IAjaxResult<TData>} The ajax result object.
     */
    getAjaxResult<TData>() : IAjaxResult<TData>;
    
    /**
     * Returns the content as file.
     * 
     * @param {String} [destFile] The custom path of the destination file.
     * 
     * @return {FileSystem.File} The file.
     */
    getFile(destFile?: string) : FileSystem.File;
    
    /**
     * Tries result the content as image source.
     * 
     * @return {Promise<Image.ImageSource>} The result.
     */
    getImage(): Promise<Image.ImageSource>;
    
    /**
     * Returns the content as JSON object.
     * 
     * @return {T} The JSON object.
     */
    getJSON<T>() : T;
    
    /**
     * Returns the content as string.
     * 
     * @return {String} The string.
     */
    getString() : string;
    
    /**
     * Gets the information about the request.
     * 
     * @property
     */
    request: IHttpRequest;
    
    /**
     * Gets the raw response.
     * 
     * @property
     */
    response: HTTP.HttpResponse;
}

/**
 * Describes an object that prepares a HTTP for authorization.
 */
export interface IAuthorizer {
    /**
     * Prepares a HTTP request for authorization.
     * 
     * @param {HTTP.HttpRequestOptions} reqOpts The request options.
     */
    prepare(reqOpts: HTTP.HttpRequestOptions);
}

/**
 * Describes an object that stores information about a HTTP request.
 */
export interface IHttpRequest {
    /**
     * Gets the raw content that is send to the API.
     */
    body: any;
    
    /**
     * Gets the underlying client.
     * 
     * @property
     */
    client: IApiClient;
    
    /**
     * Gets the list of request headers.
     */
    headers: any;
    
    /**
     * Gets the HTTP method.
     */
    method: string;
    
    /**
     * Gets the URL.
     */
    url: string;
}

/**
 * Describes an entry that stores data for
 * invoke a response action if a predicate matches. 
 */
export interface IIfResponse {
    /**
     * The action to invoke.
     * 
     * @property
     */
    action : (result : IApiClientResult) => void,
    
    /**
     * The predicate.
     * 
     * @property
     */
    predicate?: (ctx : IApiClientResult) => boolean
}

/**
 * Describes an entry that stores data for
 * invoke a response action if a status code matches. 
 */
export interface IIfStatus {
    /**
     * The action to invoke.
     * 
     * @property
     */
    action : (result : IApiClientResult) => void,
    
    /**
     * The predicate.
     * 
     * @property
     */
    predicate?: (code : number) => boolean
}

/**
 * Describes an object that stores log information. 
 */
export interface ILogMessage {
    /**
     * Gets the category.
     * 
     * @property
     */
    category: LogCategory;
    
    /**
     * Gets the message value.
     * 
     * @property
     */
    message: any;
    
    /**
     * Gets the priority.
     * 
     * @property
     */
    priority: LogPriority;
    
    /**
     * Gets the source.
     */
    source: LogSource;
    
    /**
     * Gets the tag.
     * 
     * @property
     */
    tag: string;
    
    /**
     * Gets the timestamp.
     */
    time: Date;
}

/**
 * Describes a logger.
 */
export interface ILogger {
    /**
     * Logs an alert message.
     * 
     * @chainable
     * 
     * @param any msg The message value.
     * @param {String} [tag] The optional tag value.
     * @param {LogPriority} [priority] The optional log priority.
     */
    alert(msg : any, tag?: string,
          priority?: LogPriority) : ILogger;
    
    /**
     * Logs a critical message.
     * 
     * @chainable
     * 
     * @param any msg The message value.
     * @param {String} [tag] The optional tag value.
     * @param {LogPriority} [priority] The optional log priority.
     */
    crit(msg : any, tag?: string,
         priority?: LogPriority) : ILogger;
    
    /**
     * Logs a debug message.
     * 
     * @chainable
     * 
     * @param any msg The message value.
     * @param {String} [tag] The optional tag value.
     * @param {LogPriority} [priority] The optional log priority.
     */
    dbg(msg : any, tag?: string,
        priority?: LogPriority) : ILogger;
    
    /**
     * Logs an emergency message.
     * 
     * @chainable
     * 
     * @param any msg The message value.
     * @param {String} [tag] The optional tag value.
     * @param {LogPriority} [priority] The optional log priority.
     */
    emerg(msg : any, tag?: string,
          priority?: LogPriority) : ILogger;
    
    /**
     * Logs an error message.
     * 
     * @chainable
     * 
     * @param any msg The message value.
     * @param {String} [tag] The optional tag value.
     * @param {LogPriority} [priority] The optional log priority.
     */
    err(msg : any, tag?: string,
        priority?: LogPriority) : ILogger;
    
    /**
     * Logs an info message.
     * 
     * @chainable
     * 
     * @param any msg The message value.
     * @param {String} [tag] The optional tag value.
     * @param {LogPriority} [priority] The optional log priority.
     */
    info(msg : any, tag?: string,
         priority?: LogPriority) : ILogger;
    
    /**
     * Logs a message.
     * 
     * @chainable
     * 
     * @param any msg The message value.
     * @param {String} [tag] The optional tag value.
     * @param {LogCategory} [category] The optional log category. Default: LogCategory.Debug
     * @param {LogPriority} [priority] The optional log priority.
     */
    log(msg : any, tag?: string,
        category?: LogCategory, priority?: LogPriority) : ILogger;
    
    /**
     * Logs a notice message.
     * 
     * @chainable
     * 
     * @param any msg The message value.
     * @param {String} [tag] The optional tag value.
     * @param {LogPriority} [priority] The optional log priority.
     */
    note(msg : any, tag?: string,
         priority?: LogPriority) : ILogger;
     
    /**
     * Logs a trace message.
     * 
     * @chainable
     * 
     * @param any msg The message value.
     * @param {String} [tag] The optional tag value.
     * @param {LogPriority} [priority] The optional log priority.
     */
    trace(msg : any, tag?: string,
          priority?: LogPriority) : ILogger;
        
    /**
     * Logs a warning message.
     * 
     * @chainable
     * 
     * @param any msg The message value.
     * @param {String} [tag] The optional tag value.
     * @param {LogPriority} [priority] The optional log priority.
     */
    warn(msg : any, tag?: string,
         priority?: LogPriority) : ILogger;
}

/**
 * Describes an object that stores (additional) options for a request.
 */
export interface IRequestOptions {
    /**
     * Gets the authorizer.
     * 
     * @property
     */
    authorizer? : IAuthorizer;
    
    /**
     * Gets the content.
     * 
     * @property
     */
    content?: any;
    
    /**
     * Gets the name of the encoding.
     * 
     * @property
     */
    encoding?: string;
    
    /**
     * Gets the list of request headers.
     * 
     * @property
     */
    headers? : any;
    
    /**
     * Gets the URL params to set.
     * 
     * @property
     */
    params?: any;
    
    /**
     * Gets the params for the route to set.
     * 
     * @property
     */
    routeParams?: any;
    
    /**
     * Gets the global object that should be used in any callback.
     * 
     * @property
     */
    tag?: any;
    
    /**
     * Gets the timeout in millisecons.
     * 
     * @property
     */
    timeout?: number;
    
    /**
     * Gets request type.
     * 
     * @property
     */
    type?: HttpRequestType;
}

/**
 * Describes an object that stores a global value.
 */
export interface ITagProvider {
    /**
     * Gets the value that should be linked with that instance.
     * 
     * @property
     */
    tag: any;
}

/**
 * List of log categories.
 */
export enum LogCategory {
    Emergency = 1,
    Alert = 2,
    Critical = 3,
    Error = 4,
    Warning = 5,
    Notice = 6,
    Info = 7,
    Debug = 8,
    Trace = 9
}

class LogMessage implements ILogMessage {
    private _category : LogCategory;
    private _message : any;
    private _priority : LogPriority;
    private _source : LogSource;
    private _tag : string;
    private _time : Date;
    
    constructor(source : LogSource,
                time: Date,
                msg: any, tag: string,
                category: LogCategory, priority : LogPriority) {
        
        this._source = source;
        
        this._time = time;
        
        this._message = msg;
        this._tag = tag;
        
        this._category = category;
        this._priority = priority;
    }
    
    public get category(): LogCategory {
        return this._category;
    }
    
    public get message(): any {
        return this._message;
    }
    
    public get priority(): LogPriority {
        return this._priority;
    }
    
    public get source(): LogSource {
        return this._source;
    }
    
    public get tag(): string {
        return this._tag;
    }
    
    public get time(): Date {
        return this._time;
    }
}

/**
 * List of log priorities.
 */
export enum LogPriority {
    VeryHigh = 1,
    High = 2,
    Medium = 3,
    Low = 4,
    VeryLow = 5
}

/**
 * List of log (message) source.
 */
export enum LogSource {
    /**
     * From API client.
     */
    Client,
    
    /**
     * From "completed" action
     */
    Complete,
    
    /**
     * From IApiClientError object
     */
    Error,
    
    /**
     * From IApiClientResult object
     */
    Result
}

function getOwnProperties(obj) {
    if (TypeUtils.isNullOrUndefined(obj)) {
        return undefined;
    }
    
    var properties : any = {};
    
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            properties[p] = obj[p];
        }
    }
    
    return properties;
}

function invokeLogActions(client : ApiClient, msg : ILogMessage) {
    for (var i = 0; i < client.logActions.length; i++) {
        try {
            var la = client.logActions[i];
            la(msg);
        }
        catch (e) {
            console.log("[ERROR] invokeLogActions(" + i +"): " + e);
        }
    }
}

function isEmptyString(str : string) : boolean {
    if (TypeUtils.isNullOrUndefined(str)) {
        return true;
    }
    
    return "" === str.trim();
}

function methodToString(method : any) : string {
    if (TypeUtils.isNullOrUndefined(method)) {
        return "GET";
    }
    
    if (typeof method !== "string") {
        method = HttpMethod[method];
    }

    return method.toUpperCase().trim();
}

/**
 * Creates a new client.
 * 
 * @param any config The configuration data / base URL for the client.
 * 
 * @return {IApiClient} The new client.
 */
export function newClient(config : IApiClientConfig | string) : IApiClient {
    var cfg : any = config;
    
    if (typeof cfg === "string") {
        cfg = <IApiClientConfig>{
            baseUrl: config
        };
    }
    
    if (TypeUtils.isNullOrUndefined(cfg)) {
        cfg = {};
    }
    
    return new ApiClient(cfg);
}
