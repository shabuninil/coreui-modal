
var CoreUI = typeof CoreUI !== 'undefined' ? CoreUI : {};

CoreUI.modal = {

    lang: {},
    _instances: {},
    _settings: {
        lang: 'en'
    },

    /**
     * @param {object} options
     * @returns {CoreUI.modal.instance}
     */
    create: function (options) {

        let instance = $.extend(true, {}, this.instance);
        instance._init(options instanceof Object ? options : {});

        let layoutId = instance.getId();
        this._instances[layoutId] = instance;

        return instance;
    },


    /**
     * @param {string} id
     * @returns {CoreUI.modal.instance|null}
     */
    get: function (id) {

        if ( ! this._instances.hasOwnProperty(id)) {
            return null;
        }

        if ($('#coreui-modal-' + this._instances[id])[0]) {
            delete this._instances[id];
            return null;
        }

        return this._instances[id];
    },


    /**
     * @param title
     * @param body
     * @param options
     * @returns {HTMLElement}
     */
    show: function (title, body, options) {

        options = typeof options === 'object' && ! Array.isArray(options) && options !== null
                  ? options
                  : {};

        options = $.extend(true, {}, options, {
            title : title,
            body : body,
        });

        let modal = this.create(options);

        if (typeof options.onShow === 'function') {
            modal.on('show.coreui.modal', options.onShow);
        }

        if (typeof options.onShown === 'function') {
            modal.on('shown.coreui.modal', options.onShown);
        }

        if (typeof options.onHide === 'function') {
            modal.on('hide.coreui.modal', options.onHide);
        }

        if (typeof options.onHidden === 'function') {
            modal.on('hidden.coreui.modal', options.onHidden);
        }

        return modal.show();
    },


    /**
     * @param title
     * @param url
     * @param options
     * @returns {HTMLElement}
     */
    showLoad: function (title, url, options) {

        options = typeof options === 'object' && ! Array.isArray(options) && options !== null
            ? options
            : {};

        options = $.extend(true, {}, options, {
            title : title,
            loadUrl : url,
        });

        let modal = this.create(options);

        if (typeof options.onShow === 'function') {
            modal.on('show.coreui.modal', options.onShow);
        }

        if (typeof options.onShown === 'function') {
            modal.on('shown.coreui.modal', options.onShown);
        }

        if (typeof options.onHide === 'function') {
            modal.on('hide.coreui.modal', options.onHide);
        }

        if (typeof options.onHidden === 'function') {
            modal.on('hidden.coreui.modal', options.onHidden);
        }


        return modal.show();
    },


    /**
     * Скрытие последнего открытого модала
     * @param {function} callback
     */
    hideLast: function (callback) {

        let instances = this._instances.reverse();

        $.each(instances, function (key, instance) {
            let modalElement = document.getElementById('coreui-modal-' + instance.getId());

            if (modalElement) {
                if (typeof callback === 'function') {
                    instance.on('hidden.coreui.modal', callback);
                }

                instance.hide();
                return false;
            }
        });
    },


    /**
     * Скрытие всех открытых модалов
     * @param {function} callback
     */
    hideAll: function (callback) {

        if (typeof callback === 'function') {
            $.each(this._instances, function (key, instance) {
                let modalElement = document.getElementById('coreui-modal-' + instance.getId());

                if (modalElement) {
                    instance.on('hidden.coreui.modal', callback);
                    return false;
                }
            });
        }


        let instances = this._instances.reverse();

        $.each(instances, function (key, instance) {
            let modalElement = document.getElementById('coreui-modal-' + instance.getId());

            if (modalElement) {
                instance.hide();
            }
        });
    },


    /**
     * Установка настроек
     * @param {object} settings
     */
    setSettings: function(settings) {

        CoreUI.modal._settings = $.extend(this, {}, this._settings, settings);
    },


    /**
     * Получение значения настройки
     * @param {string} name
     */
    getSetting: function(name) {

        let value = null;

        if (CoreUI.modal._settings.hasOwnProperty(name)) {
            value = CoreUI.modal._settings[name];
        }

        return value;
    }
};

CoreUI.modal.instance = {

    _options: {
        id: '',
        lang: 'en',
        backdrop: true,
        loadUrl: null,
        size: 'lg',
        title: null,
        body: null,
        footer: null
    },
    _modal: null,
    _events: {},


    /**
     * Инициализация
     * @param options
     */
    _init: function (options) {

        this._options.lang = CoreUI.modal.getSetting('lang');

        this._options = $.extend(true, {}, this._options, options);

        if ( ! this._options.id) {
            this._options.id = CoreUI.modal.utils.hashCode();
        }
    },


    /**
     *
     * @returns {*}
     */
    getId: function () {
        return this._options.id;
    },


    /**
     * Получение параметров
     * @returns {object}
     */
    getOptions: function () {
        return $.extend(true, {}, this._options);
    },


    /**
     * Установка содержимого модала
     * @param {string} content
     */
    setBodyContent: function (content) {

        let container = $('#coreui-modal-' + this._options.id + ' .modal-body');

        if (container[0]) {
            container.html(this._renderContent(content));
            this._trigger('change-body.coreui.modal', this, [ this ]);
        }
    },


    /**
     Установка заголовка модала
     * @param {string} content
     */
    setTitleContent: function (content) {

        let container = $('#coreui-modal-' + this._options.id + ' .modal-title');

        if (container[0]) {
            container.html(content);
            this._trigger('change-title.coreui.modal', this, [ this ]);
        }
    },


    /**
     Установка подвала модала
     * @param {string} content
     */
    setFooterContent: function (content) {

        let container = $('#coreui-modal-' + this._options.id);

        if (container[0]) {
            let footer = container.find('.modal-footer');

            if (footer[0]) {
                footer.html(content);
            } else {
                container.find('.modal-content').append('<div class="modal-footer">' + content + '</div>');
            }

            this._trigger('change-footer.coreui.modal', this, [ this ]);
        }
    },


    /**
     * Загрузка содержимого модала
     * @param {string} url
     */
    loadBodyContent: function (url) {

        let that      = this;
        let container = $('#coreui-modal-' + this._options.id + ' .modal-body');


        if (container[0]) {
            let html = CoreUI.modal.ejs.render(CoreUI.modal.tpl['loading.html'], {
                lang: that.getLang()
            });

            container.html(html);

            $.ajax({
                url: url,
                method: 'GET',
                beforeSend: function(xhr) {
                    that._trigger('before-load.coreui.modal', that, [ that, xhr ]);
                },
                success: function (result) {
                    container.html(that._renderContent(result));

                    that._trigger('success-load.coreui.modal', that, [ that, result ]);
                    that._trigger('change-body.coreui.modal', that, [ that ]);
                },
                error: function(xhr, textStatus, errorThrown) {
                    that._trigger('error-load.coreui.modal', that, [ that, xhr, textStatus, errorThrown ]);
                },
                complete: function(xhr, textStatus) {
                    that._trigger('complete-load.coreui.modal', that, [ that, xhr, textStatus ]);
                },
            });
        }
    },


    /**
     * Показ модала
     * @return {HTMLElement}
     */
    show: function() {

        let modalElement = document.getElementById('coreui-modal-' + this._options.id);

        if (modalElement) {
            return modalElement;
        }


        let html = CoreUI.modal.ejs.render(CoreUI.modal.tpl['modal.html'], {
            modal: this._options,
            body: this._options.body ? this._renderContent(this._options.body) : ''
        });


        $('body').append(html);

        modalElement = document.getElementById('coreui-modal-' + this._options.id);
        this._modal  = new bootstrap.Modal(modalElement, {
            backdrop: this._options.backdrop,
        })

        let that = this;

        modalElement.addEventListener('show.bs.modal', function (e) {
            that._trigger('show.coreui.modal', that, [ that ]);
        });

        modalElement.addEventListener('shown.bs.modal', function (e) {
            that._trigger('shown.coreui.modal', that, [ that ]);
        });

        modalElement.addEventListener('hide.bs.modal', function (e) {
            that._trigger('hide.coreui.modal', that, [ that ]);
        });

        modalElement.addEventListener('hidden.bs.modal', function (e) {
            modalElement.remove();

            that._trigger('hidden.coreui.modal', that, [ that ]);
        });

        this._modal.show();

        if (this._options.loadUrl) {
            this.loadBodyContent(this._options.loadUrl);
        }

        return modalElement;
    },


    /**
     * Скрытие модала
     */
    hide: function () {

        if (this._modal) {
            this._modal.hide();
            this._modal = null;
        }
    },


    /**
     * Удаление модала
     */
    destruct: function () {

        $('#coreui-modal-' + this._options.id).remove();
        delete CoreUI.modal._instances[this.getId()];
    },


    /**
     * Получение настроек языка
     * @private
     */
    getLang: function () {

        return CoreUI.modal.lang.hasOwnProperty(this._options.lang)
               ? CoreUI.modal.lang[this._options.lang]
               : CoreUI.modal.lang['en'];
    },


    /**
     * @param eventName
     * @param callback
     * @param context
     * @param singleExec
     */
    on: function(eventName, callback, context, singleExec) {

        if (typeof this._events[eventName] !== 'object') {
            this._events[eventName] = [];
        }

        this._events[eventName].push({
            context : context || this,
            callback: callback,
            singleExec: !! singleExec,
        });
    },


    /**
     * Выполнение события
     * @param name
     * @param context
     * @param params
     * @private
     */
    _trigger: function(name, context, params) {

        params = params || [];

        if (this._events.hasOwnProperty(name) && this._events[name].length > 0) {
            for (var i = 0; i < this._events[name].length; i++) {
                let callback = this._events[name][i].callback;

                context = this._events[name][i].context || context;

                callback.apply(context, params);

                if (this._events[name][i].singleExec) {
                    this._events[name].splice(i, 1);
                    i--;
                }
            }
        }
    },


    /**
     *
     * @param data
     * @returns {string}
     * @private
     */
    _renderContent: function(data) {

        let result          = [];
        let alloyComponents = [
            'coreui.table',
            'coreui.form',
            'coreui.panel',
            'coreui.layout',
            'coreui.tabs',
            'coreui.info',
            'coreui.chart',
        ];

        if (typeof data === 'string') {
            result.push(data);

        } else if (data instanceof Object) {
            if ( ! Array.isArray(data)) {
                data = [ data ];
            }

            for (let i = 0; i < data.length; i++) {
                if (typeof data[i] === 'string') {
                    result.push(data[i]);

                } else {
                    if ( ! Array.isArray(data[i]) &&
                        data[i].hasOwnProperty('component') &&
                        alloyComponents.indexOf(data[i].component) >= 0
                    ) {
                        let name = data[i].component.split('.')[1];

                        if (CoreUI.hasOwnProperty(name)) {
                            let instance = CoreUI[name].create(data[i]);
                            result.push(instance.render());

                            this.on('shown.coreui.modal', instance.initEvents, instance, true);
                        } else {
                            result.push(JSON.stringify(data[i]));
                        }

                    } else {
                        result.push(JSON.stringify(data[i]));
                    }
                }
            }
        }

        return result.join('');
    }
};

CoreUI.modal.utils = {


    /**
     * @returns {string}
     * @private
     */
    hashCode: function() {
        return this.crc32((new Date().getTime() + Math.random()).toString()).toString(16);
    },


    /**
     * @param str
     * @returns {number}
     * @private
     */
    crc32: function (str) {

        for (var a, o = [], c = 0; c < 256; c++) {
            a = c;
            for (var f = 0; f < 8; f++) {
                a = 1 & a ? 3988292384 ^ a >>> 1 : a >>> 1
            }
            o[c] = a
        }

        for (var n = -1, t = 0; t < str.length; t++) {
            n = n >>> 8 ^ o[255 & (n ^ str.charCodeAt(t))]
        }

        return (-1 ^ n) >>> 0;
    }
};
//HEAD 
window["CoreUI"]["modal"]["tpl"] = {};

window["CoreUI"]["modal"]["tpl"]["loading.html"] = "<div class=\"py-4 d-flex justify-content-center align-items-center gap-2\">\n" +
    "  <div class=\"spinner-border mr-2\"></div> <%= lang.loading %>\n" +
    "</div>\n" +
    ""; 

window["CoreUI"]["modal"]["tpl"]["modal.html"] = "<div class=\"modal fade\" id=\"coreui-modal-<%= modal.id %>\">\n" +
    "    <div class=\"modal-dialog <% if (modal.size) { %>modal-<%= modal.size %><% } %>\">\n" +
    "        <div class=\"modal-content\">\n" +
    "            <div class=\"modal-header\">\n" +
    "                <h5 class=\"modal-title\"><%- modal.title %></h5>\n" +
    "                <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"modal\"></button>\n" +
    "            </div>\n" +
    "            <div class=\"modal-body\">\n" +
    "                <%- body %>\n" +
    "            </div>\n" +
    "            <% if (modal.footer) { %>\n" +
    "            <div class=\"modal-footer\">\n" +
    "                <%- modal.footer %>\n" +
    "            </div>\n" +
    "            <% } %>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>"; 
// END ;
(function() {"use strict";(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ejs=f()}})(function(){var define,module,exports;return function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r}()({1:[function(require,module,exports){"use strict";var fs=require("fs");var path=require("path");var utils=require("./utils");var scopeOptionWarned=false;var _VERSION_STRING=require("../package.json").version;var _DEFAULT_OPEN_DELIMITER="<";var _DEFAULT_CLOSE_DELIMITER=">";var _DEFAULT_DELIMITER="%";var _DEFAULT_LOCALS_NAME="locals";var _NAME="ejs";var _REGEX_STRING="(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)";var _OPTS_PASSABLE_WITH_DATA=["delimiter","scope","context","debug","compileDebug","client","_with","rmWhitespace","strict","filename","async"];var _OPTS_PASSABLE_WITH_DATA_EXPRESS=_OPTS_PASSABLE_WITH_DATA.concat("cache");var _BOM=/^\uFEFF/;var _JS_IDENTIFIER=/^[a-zA-Z_$][0-9a-zA-Z_$]*$/;exports.cache=utils.cache;exports.fileLoader=fs.readFileSync;exports.localsName=_DEFAULT_LOCALS_NAME;exports.promiseImpl=new Function("return this;")().Promise;exports.resolveInclude=function(name,filename,isDir){var dirname=path.dirname;var extname=path.extname;var resolve=path.resolve;var includePath=resolve(isDir?filename:dirname(filename),name);var ext=extname(name);if(!ext){includePath+=".ejs"}return includePath};function resolvePaths(name,paths){var filePath;if(paths.some(function(v){filePath=exports.resolveInclude(name,v,true);return fs.existsSync(filePath)})){return filePath}}function getIncludePath(path,options){var includePath;var filePath;var views=options.views;var match=/^[A-Za-z]+:\\|^\//.exec(path);if(match&&match.length){path=path.replace(/^\/*/,"");if(Array.isArray(options.root)){includePath=resolvePaths(path,options.root)}else{includePath=exports.resolveInclude(path,options.root||"/",true)}}else{if(options.filename){filePath=exports.resolveInclude(path,options.filename);if(fs.existsSync(filePath)){includePath=filePath}}if(!includePath&&Array.isArray(views)){includePath=resolvePaths(path,views)}if(!includePath&&typeof options.includer!=="function"){throw new Error('Could not find the include file "'+options.escapeFunction(path)+'"')}}return includePath}function handleCache(options,template){var func;var filename=options.filename;var hasTemplate=arguments.length>1;if(options.cache){if(!filename){throw new Error("cache option requires a filename")}func=exports.cache.get(filename);if(func){return func}if(!hasTemplate){template=fileLoader(filename).toString().replace(_BOM,"")}}else if(!hasTemplate){if(!filename){throw new Error("Internal EJS error: no file name or template "+"provided")}template=fileLoader(filename).toString().replace(_BOM,"")}func=exports.compile(template,options);if(options.cache){exports.cache.set(filename,func)}return func}function tryHandleCache(options,data,cb){var result;if(!cb){if(typeof exports.promiseImpl=="function"){return new exports.promiseImpl(function(resolve,reject){try{result=handleCache(options)(data);resolve(result)}catch(err){reject(err)}})}else{throw new Error("Please provide a callback function")}}else{try{result=handleCache(options)(data)}catch(err){return cb(err)}cb(null,result)}}function fileLoader(filePath){return exports.fileLoader(filePath)}function includeFile(path,options){var opts=utils.shallowCopy(utils.createNullProtoObjWherePossible(),options);opts.filename=getIncludePath(path,opts);if(typeof options.includer==="function"){var includerResult=options.includer(path,opts.filename);if(includerResult){if(includerResult.filename){opts.filename=includerResult.filename}if(includerResult.template){return handleCache(opts,includerResult.template)}}}return handleCache(opts)}function rethrow(err,str,flnm,lineno,esc){var lines=str.split("\n");var start=Math.max(lineno-3,0);var end=Math.min(lines.length,lineno+3);var filename=esc(flnm);var context=lines.slice(start,end).map(function(line,i){var curr=i+start+1;return(curr==lineno?" >> ":"    ")+curr+"| "+line}).join("\n");err.path=filename;err.message=(filename||"ejs")+":"+lineno+"\n"+context+"\n\n"+err.message;throw err}function stripSemi(str){return str.replace(/;(\s*$)/,"$1")}exports.compile=function compile(template,opts){var templ;if(opts&&opts.scope){if(!scopeOptionWarned){console.warn("`scope` option is deprecated and will be removed in EJS 3");scopeOptionWarned=true}if(!opts.context){opts.context=opts.scope}delete opts.scope}templ=new Template(template,opts);return templ.compile()};exports.render=function(template,d,o){var data=d||utils.createNullProtoObjWherePossible();var opts=o||utils.createNullProtoObjWherePossible();if(arguments.length==2){utils.shallowCopyFromList(opts,data,_OPTS_PASSABLE_WITH_DATA)}return handleCache(opts,template)(data)};exports.renderFile=function(){var args=Array.prototype.slice.call(arguments);var filename=args.shift();var cb;var opts={filename:filename};var data;var viewOpts;if(typeof arguments[arguments.length-1]=="function"){cb=args.pop()}if(args.length){data=args.shift();if(args.length){utils.shallowCopy(opts,args.pop())}else{if(data.settings){if(data.settings.views){opts.views=data.settings.views}if(data.settings["view cache"]){opts.cache=true}viewOpts=data.settings["view options"];if(viewOpts){utils.shallowCopy(opts,viewOpts)}}utils.shallowCopyFromList(opts,data,_OPTS_PASSABLE_WITH_DATA_EXPRESS)}opts.filename=filename}else{data=utils.createNullProtoObjWherePossible()}return tryHandleCache(opts,data,cb)};exports.Template=Template;exports.clearCache=function(){exports.cache.reset()};function Template(text,opts){opts=opts||utils.createNullProtoObjWherePossible();var options=utils.createNullProtoObjWherePossible();this.templateText=text;this.mode=null;this.truncate=false;this.currentLine=1;this.source="";options.client=opts.client||false;options.escapeFunction=opts.escape||opts.escapeFunction||utils.escapeXML;options.compileDebug=opts.compileDebug!==false;options.debug=!!opts.debug;options.filename=opts.filename;options.openDelimiter=opts.openDelimiter||exports.openDelimiter||_DEFAULT_OPEN_DELIMITER;options.closeDelimiter=opts.closeDelimiter||exports.closeDelimiter||_DEFAULT_CLOSE_DELIMITER;options.delimiter=opts.delimiter||exports.delimiter||_DEFAULT_DELIMITER;options.strict=opts.strict||false;options.context=opts.context;options.cache=opts.cache||false;options.rmWhitespace=opts.rmWhitespace;options.root=opts.root;options.includer=opts.includer;options.outputFunctionName=opts.outputFunctionName;options.localsName=opts.localsName||exports.localsName||_DEFAULT_LOCALS_NAME;options.views=opts.views;options.async=opts.async;options.destructuredLocals=opts.destructuredLocals;options.legacyInclude=typeof opts.legacyInclude!="undefined"?!!opts.legacyInclude:true;if(options.strict){options._with=false}else{options._with=typeof opts._with!="undefined"?opts._with:true}this.opts=options;this.regex=this.createRegex()}Template.modes={EVAL:"eval",ESCAPED:"escaped",RAW:"raw",COMMENT:"comment",LITERAL:"literal"};Template.prototype={createRegex:function(){var str=_REGEX_STRING;var delim=utils.escapeRegExpChars(this.opts.delimiter);var open=utils.escapeRegExpChars(this.opts.openDelimiter);var close=utils.escapeRegExpChars(this.opts.closeDelimiter);str=str.replace(/%/g,delim).replace(/</g,open).replace(/>/g,close);return new RegExp(str)},compile:function(){var src;var fn;var opts=this.opts;var prepended="";var appended="";var escapeFn=opts.escapeFunction;var ctor;var sanitizedFilename=opts.filename?JSON.stringify(opts.filename):"undefined";if(!this.source){this.generateSource();prepended+='  var __output = "";\n'+"  function __append(s) { if (s !== undefined && s !== null) __output += s }\n";if(opts.outputFunctionName){if(!_JS_IDENTIFIER.test(opts.outputFunctionName)){throw new Error("outputFunctionName is not a valid JS identifier.")}prepended+="  var "+opts.outputFunctionName+" = __append;"+"\n"}if(opts.localsName&&!_JS_IDENTIFIER.test(opts.localsName)){throw new Error("localsName is not a valid JS identifier.")}if(opts.destructuredLocals&&opts.destructuredLocals.length){var destructuring="  var __locals = ("+opts.localsName+" || {}),\n";for(var i=0;i<opts.destructuredLocals.length;i++){var name=opts.destructuredLocals[i];if(!_JS_IDENTIFIER.test(name)){throw new Error("destructuredLocals["+i+"] is not a valid JS identifier.")}if(i>0){destructuring+=",\n  "}destructuring+=name+" = __locals."+name}prepended+=destructuring+";\n"}if(opts._with!==false){prepended+="  with ("+opts.localsName+" || {}) {"+"\n";appended+="  }"+"\n"}appended+="  return __output;"+"\n";this.source=prepended+this.source+appended}if(opts.compileDebug){src="var __line = 1"+"\n"+"  , __lines = "+JSON.stringify(this.templateText)+"\n"+"  , __filename = "+sanitizedFilename+";"+"\n"+"try {"+"\n"+this.source+"} catch (e) {"+"\n"+"  rethrow(e, __lines, __filename, __line, escapeFn);"+"\n"+"}"+"\n"}else{src=this.source}if(opts.client){src="escapeFn = escapeFn || "+escapeFn.toString()+";"+"\n"+src;if(opts.compileDebug){src="rethrow = rethrow || "+rethrow.toString()+";"+"\n"+src}}if(opts.strict){src='"use strict";\n'+src}if(opts.debug){console.log(src)}if(opts.compileDebug&&opts.filename){src=src+"\n"+"//# sourceURL="+sanitizedFilename+"\n"}try{if(opts.async){try{ctor=new Function("return (async function(){}).constructor;")()}catch(e){if(e instanceof SyntaxError){throw new Error("This environment does not support async/await")}else{throw e}}}else{ctor=Function}fn=new ctor(opts.localsName+", escapeFn, include, rethrow",src)}catch(e){if(e instanceof SyntaxError){if(opts.filename){e.message+=" in "+opts.filename}e.message+=" while compiling ejs\n\n";e.message+="If the above error is not helpful, you may want to try EJS-Lint:\n";e.message+="https://github.com/RyanZim/EJS-Lint";if(!opts.async){e.message+="\n";e.message+="Or, if you meant to create an async function, pass `async: true` as an option."}}throw e}var returnedFn=opts.client?fn:function anonymous(data){var include=function(path,includeData){var d=utils.shallowCopy(utils.createNullProtoObjWherePossible(),data);if(includeData){d=utils.shallowCopy(d,includeData)}return includeFile(path,opts)(d)};return fn.apply(opts.context,[data||utils.createNullProtoObjWherePossible(),escapeFn,include,rethrow])};if(opts.filename&&typeof Object.defineProperty==="function"){var filename=opts.filename;var basename=path.basename(filename,path.extname(filename));try{Object.defineProperty(returnedFn,"name",{value:basename,writable:false,enumerable:false,configurable:true})}catch(e){}}return returnedFn},generateSource:function(){var opts=this.opts;if(opts.rmWhitespace){this.templateText=this.templateText.replace(/[\r\n]+/g,"\n").replace(/^\s+|\s+$/gm,"")}this.templateText=this.templateText.replace(/[ \t]*<%_/gm,"<%_").replace(/_%>[ \t]*/gm,"_%>");var self=this;var matches=this.parseTemplateText();var d=this.opts.delimiter;var o=this.opts.openDelimiter;var c=this.opts.closeDelimiter;if(matches&&matches.length){matches.forEach(function(line,index){var closing;if(line.indexOf(o+d)===0&&line.indexOf(o+d+d)!==0){closing=matches[index+2];if(!(closing==d+c||closing=="-"+d+c||closing=="_"+d+c)){throw new Error('Could not find matching close tag for "'+line+'".')}}self.scanLine(line)})}},parseTemplateText:function(){var str=this.templateText;var pat=this.regex;var result=pat.exec(str);var arr=[];var firstPos;while(result){firstPos=result.index;if(firstPos!==0){arr.push(str.substring(0,firstPos));str=str.slice(firstPos)}arr.push(result[0]);str=str.slice(result[0].length);result=pat.exec(str)}if(str){arr.push(str)}return arr},_addOutput:function(line){if(this.truncate){line=line.replace(/^(?:\r\n|\r|\n)/,"");this.truncate=false}if(!line){return line}line=line.replace(/\\/g,"\\\\");line=line.replace(/\n/g,"\\n");line=line.replace(/\r/g,"\\r");line=line.replace(/"/g,'\\"');this.source+='    ; __append("'+line+'")'+"\n"},scanLine:function(line){var self=this;var d=this.opts.delimiter;var o=this.opts.openDelimiter;var c=this.opts.closeDelimiter;var newLineCount=0;newLineCount=line.split("\n").length-1;switch(line){case o+d:case o+d+"_":this.mode=Template.modes.EVAL;break;case o+d+"=":this.mode=Template.modes.ESCAPED;break;case o+d+"-":this.mode=Template.modes.RAW;break;case o+d+"#":this.mode=Template.modes.COMMENT;break;case o+d+d:this.mode=Template.modes.LITERAL;this.source+='    ; __append("'+line.replace(o+d+d,o+d)+'")'+"\n";break;case d+d+c:this.mode=Template.modes.LITERAL;this.source+='    ; __append("'+line.replace(d+d+c,d+c)+'")'+"\n";break;case d+c:case"-"+d+c:case"_"+d+c:if(this.mode==Template.modes.LITERAL){this._addOutput(line)}this.mode=null;this.truncate=line.indexOf("-")===0||line.indexOf("_")===0;break;default:if(this.mode){switch(this.mode){case Template.modes.EVAL:case Template.modes.ESCAPED:case Template.modes.RAW:if(line.lastIndexOf("//")>line.lastIndexOf("\n")){line+="\n"}}switch(this.mode){case Template.modes.EVAL:this.source+="    ; "+line+"\n";break;case Template.modes.ESCAPED:this.source+="    ; __append(escapeFn("+stripSemi(line)+"))"+"\n";break;case Template.modes.RAW:this.source+="    ; __append("+stripSemi(line)+")"+"\n";break;case Template.modes.COMMENT:break;case Template.modes.LITERAL:this._addOutput(line);break}}else{this._addOutput(line)}}if(self.opts.compileDebug&&newLineCount){this.currentLine+=newLineCount;this.source+="    ; __line = "+this.currentLine+"\n"}}};exports.escapeXML=utils.escapeXML;exports.__express=exports.renderFile;exports.VERSION=_VERSION_STRING;exports.name=_NAME;if(typeof window!="undefined"){window.ejs=exports}},{"../package.json":6,"./utils":2,fs:3,path:4}],2:[function(require,module,exports){"use strict";var regExpChars=/[|\\{}()[\]^$+*?.]/g;var hasOwnProperty=Object.prototype.hasOwnProperty;var hasOwn=function(obj,key){return hasOwnProperty.apply(obj,[key])};exports.escapeRegExpChars=function(string){if(!string){return""}return String(string).replace(regExpChars,"\\$&")};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"};var _MATCH_HTML=/[&<>'"]/g;function encode_char(c){return _ENCODE_HTML_RULES[c]||c}var escapeFuncStr="var _ENCODE_HTML_RULES = {\n"+'      "&": "&amp;"\n'+'    , "<": "&lt;"\n'+'    , ">": "&gt;"\n'+'    , \'"\': "&#34;"\n'+'    , "\'": "&#39;"\n'+"    }\n"+"  , _MATCH_HTML = /[&<>'\"]/g;\n"+"function encode_char(c) {\n"+"  return _ENCODE_HTML_RULES[c] || c;\n"+"};\n";exports.escapeXML=function(markup){return markup==undefined?"":String(markup).replace(_MATCH_HTML,encode_char)};function escapeXMLToString(){return Function.prototype.toString.call(this)+";\n"+escapeFuncStr}try{if(typeof Object.defineProperty==="function"){Object.defineProperty(exports.escapeXML,"toString",{value:escapeXMLToString})}else{exports.escapeXML.toString=escapeXMLToString}}catch(err){console.warn("Unable to set escapeXML.toString (is the Function prototype frozen?)")}exports.shallowCopy=function(to,from){from=from||{};if(to!==null&&to!==undefined){for(var p in from){if(!hasOwn(from,p)){continue}if(p==="__proto__"||p==="constructor"){continue}to[p]=from[p]}}return to};exports.shallowCopyFromList=function(to,from,list){list=list||[];from=from||{};if(to!==null&&to!==undefined){for(var i=0;i<list.length;i++){var p=list[i];if(typeof from[p]!="undefined"){if(!hasOwn(from,p)){continue}if(p==="__proto__"||p==="constructor"){continue}to[p]=from[p]}}}return to};exports.cache={_data:{},set:function(key,val){this._data[key]=val},get:function(key){return this._data[key]},remove:function(key){delete this._data[key]},reset:function(){this._data={}}};exports.hyphenToCamel=function(str){return str.replace(/-[a-z]/g,function(match){return match[1].toUpperCase()})};exports.createNullProtoObjWherePossible=function(){if(typeof Object.create=="function"){return function(){return Object.create(null)}}if(!({__proto__:null}instanceof Object)){return function(){return{__proto__:null}}}return function(){return{}}}()},{}],3:[function(require,module,exports){},{}],4:[function(require,module,exports){(function(process){function normalizeArray(parts,allowAboveRoot){var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1)}else if(last===".."){parts.splice(i,1);up++}else if(up){parts.splice(i,1);up--}}if(allowAboveRoot){for(;up--;up){parts.unshift("..")}}return parts}exports.resolve=function(){var resolvedPath="",resolvedAbsolute=false;for(var i=arguments.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?arguments[i]:process.cwd();if(typeof path!=="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!path){continue}resolvedPath=path+"/"+resolvedPath;resolvedAbsolute=path.charAt(0)==="/"}resolvedPath=normalizeArray(filter(resolvedPath.split("/"),function(p){return!!p}),!resolvedAbsolute).join("/");return(resolvedAbsolute?"/":"")+resolvedPath||"."};exports.normalize=function(path){var isAbsolute=exports.isAbsolute(path),trailingSlash=substr(path,-1)==="/";path=normalizeArray(filter(path.split("/"),function(p){return!!p}),!isAbsolute).join("/");if(!path&&!isAbsolute){path="."}if(path&&trailingSlash){path+="/"}return(isAbsolute?"/":"")+path};exports.isAbsolute=function(path){return path.charAt(0)==="/"};exports.join=function(){var paths=Array.prototype.slice.call(arguments,0);return exports.normalize(filter(paths,function(p,index){if(typeof p!=="string"){throw new TypeError("Arguments to path.join must be strings")}return p}).join("/"))};exports.relative=function(from,to){from=exports.resolve(from).substr(1);to=exports.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=="")break}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=="")break}if(start>end)return[];return arr.slice(start,end-start+1)}var fromParts=trim(from.split("/"));var toParts=trim(to.split("/"));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push("..")}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join("/")};exports.sep="/";exports.delimiter=":";exports.dirname=function(path){if(typeof path!=="string")path=path+"";if(path.length===0)return".";var code=path.charCodeAt(0);var hasRoot=code===47;var end=-1;var matchedSlash=true;for(var i=path.length-1;i>=1;--i){code=path.charCodeAt(i);if(code===47){if(!matchedSlash){end=i;break}}else{matchedSlash=false}}if(end===-1)return hasRoot?"/":".";if(hasRoot&&end===1){return"/"}return path.slice(0,end)};function basename(path){if(typeof path!=="string")path=path+"";var start=0;var end=-1;var matchedSlash=true;var i;for(i=path.length-1;i>=0;--i){if(path.charCodeAt(i)===47){if(!matchedSlash){start=i+1;break}}else if(end===-1){matchedSlash=false;end=i+1}}if(end===-1)return"";return path.slice(start,end)}exports.basename=function(path,ext){var f=basename(path);if(ext&&f.substr(-1*ext.length)===ext){f=f.substr(0,f.length-ext.length)}return f};exports.extname=function(path){if(typeof path!=="string")path=path+"";var startDot=-1;var startPart=0;var end=-1;var matchedSlash=true;var preDotState=0;for(var i=path.length-1;i>=0;--i){var code=path.charCodeAt(i);if(code===47){if(!matchedSlash){startPart=i+1;break}continue}if(end===-1){matchedSlash=false;end=i+1}if(code===46){if(startDot===-1)startDot=i;else if(preDotState!==1)preDotState=1}else if(startDot!==-1){preDotState=-1}}if(startDot===-1||end===-1||preDotState===0||preDotState===1&&startDot===end-1&&startDot===startPart+1){return""}return path.slice(startDot,end)};function filter(xs,f){if(xs.filter)return xs.filter(f);var res=[];for(var i=0;i<xs.length;i++){if(f(xs[i],i,xs))res.push(xs[i])}return res}var substr="ab".substr(-1)==="b"?function(str,start,len){return str.substr(start,len)}:function(str,start,len){if(start<0)start=str.length+start;return str.substr(start,len)}}).call(this,require("_process"))},{_process:5}],5:[function(require,module,exports){var process=module.exports={};var cachedSetTimeout;var cachedClearTimeout;function defaultSetTimout(){throw new Error("setTimeout has not been defined")}function defaultClearTimeout(){throw new Error("clearTimeout has not been defined")}(function(){try{if(typeof setTimeout==="function"){cachedSetTimeout=setTimeout}else{cachedSetTimeout=defaultSetTimout}}catch(e){cachedSetTimeout=defaultSetTimout}try{if(typeof clearTimeout==="function"){cachedClearTimeout=clearTimeout}else{cachedClearTimeout=defaultClearTimeout}}catch(e){cachedClearTimeout=defaultClearTimeout}})();function runTimeout(fun){if(cachedSetTimeout===setTimeout){return setTimeout(fun,0)}if((cachedSetTimeout===defaultSetTimout||!cachedSetTimeout)&&setTimeout){cachedSetTimeout=setTimeout;return setTimeout(fun,0)}try{return cachedSetTimeout(fun,0)}catch(e){try{return cachedSetTimeout.call(null,fun,0)}catch(e){return cachedSetTimeout.call(this,fun,0)}}}function runClearTimeout(marker){if(cachedClearTimeout===clearTimeout){return clearTimeout(marker)}if((cachedClearTimeout===defaultClearTimeout||!cachedClearTimeout)&&clearTimeout){cachedClearTimeout=clearTimeout;return clearTimeout(marker)}try{return cachedClearTimeout(marker)}catch(e){try{return cachedClearTimeout.call(null,marker)}catch(e){return cachedClearTimeout.call(this,marker)}}}var queue=[];var draining=false;var currentQueue;var queueIndex=-1;function cleanUpNextTick(){if(!draining||!currentQueue){return}draining=false;if(currentQueue.length){queue=currentQueue.concat(queue)}else{queueIndex=-1}if(queue.length){drainQueue()}}function drainQueue(){if(draining){return}var timeout=runTimeout(cleanUpNextTick);draining=true;var len=queue.length;while(len){currentQueue=queue;queue=[];while(++queueIndex<len){if(currentQueue){currentQueue[queueIndex].run()}}queueIndex=-1;len=queue.length}currentQueue=null;draining=false;runClearTimeout(timeout)}process.nextTick=function(fun){var args=new Array(arguments.length-1);if(arguments.length>1){for(var i=1;i<arguments.length;i++){args[i-1]=arguments[i]}}queue.push(new Item(fun,args));if(queue.length===1&&!draining){runTimeout(drainQueue)}};function Item(fun,array){this.fun=fun;this.array=array}Item.prototype.run=function(){this.fun.apply(null,this.array)};process.title="browser";process.browser=true;process.env={};process.argv=[];process.version="";process.versions={};function noop(){}process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.prependListener=noop;process.prependOnceListener=noop;process.listeners=function(name){return[]};process.binding=function(name){throw new Error("process.binding is not supported")};process.cwd=function(){return"/"};process.chdir=function(dir){throw new Error("process.chdir is not supported")};process.umask=function(){return 0}},{}],6:[function(require,module,exports){module.exports={name:"ejs",description:"Embedded JavaScript templates",keywords:["template","engine","ejs"],version:"3.1.8",author:"Matthew Eernisse <mde@fleegix.org> (http://fleegix.org)",license:"Apache-2.0",bin:{ejs:"./bin/cli.js"},main:"./lib/ejs.js",jsdelivr:"ejs.min.js",unpkg:"ejs.min.js",repository:{type:"git",url:"git://github.com/mde/ejs.git"},bugs:"https://github.com/mde/ejs/issues",homepage:"https://github.com/mde/ejs",dependencies:{jake:"^10.8.5"},devDependencies:{browserify:"^16.5.1",eslint:"^6.8.0","git-directory-deploy":"^1.5.1",jsdoc:"^4.0.2","lru-cache":"^4.0.1",mocha:"^10.2.0","uglify-js":"^3.3.16"},engines:{node:">=0.10.0"},scripts:{test:"mocha -u tdd"}}},{}]},{},[1])(1)});
;CoreUI.modal.ejs = ejs;})();;

CoreUI.modal.lang.en = {
    "loading": "Loading...",
};

CoreUI.modal.lang.ru = {
    "loading": "Загрузка...",
}