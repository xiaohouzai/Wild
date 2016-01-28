/**
 * Created by Hekx on 16/1/5.
 */
;(function (window, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return factory.call(window);
        });
    }
    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory.call(window);
    } else {
        window.hupload = factory.call(window);
    }
}(typeof global === 'object' ? global : window, function () {
    'use strict';

    var checkFile = (function () {
        var file = typeof window.File !== 'undefined' ? true : false,
            form = typeof window.FormData !== 'undefined' ? true : false,
            fileReader = typeof window.FileReader !== 'undefined' ? true : false;
        return {
            file: file,
            form: form,
            fileReader: fileReader
        }
    }());
    var cacheID = {};
    var Hupload = function (opts) {
        return new Hupload.fn.init(opts);
    };
    Hupload.fn = Hupload.prototype;

    var init = Hupload.fn.init = function (opts) {
            var config = {
                fileId: '',
                fileUploadUrl: '',
                beforeUpload: null,
                maxFileSize: '',
                allowFileType: '',
                multiple: false,
                data: null,
                callback: null,
                progress: null,
                control: false
            };
            this.opts = Hupload.utilKit.extend({}, config);
            for (var attr in opts) {
                if (this.opts.hasOwnProperty(attr)) {
                    this.opts[attr] = opts[attr];
                }
            }
            this.fileInput = typeof this.opts.fileId !== '' ? Hupload.utilKit.$node(this.opts.fileId) : 'file';
            if(this.fileInput.getAttribute('name') === null){
                this.fileInput.setAttribute('name','upload');
            }
            if(this.opts.multiple)this.fileInput.setAttribute('multiple','multiple');
            !this.opts.control && this._init();
        },
        methodsUploadFile;

    init.prototype = Hupload.fn;

    methodsUploadFile = {
        upload: function () {
            if (this.opts.control === true && this.fileInput.value !== '' && !checkFile.file && !checkFile.form) {
                this._onChangeUpload();
            } else if(this.opts.control === true && this.fileInput.value !== '' && checkFile.file && checkFile.form){
                this._onAjax();
            }
        },
        _init: function () {
            if (checkFile.file && checkFile.form && checkFile.fileReader) {
                this._onChangeAjax();
            } else {
                this._onIEChange();
            }
        },
        _onChangeAjax : function(){
            var self = this;
            Hupload.utilKit.addEvent(self.fileInput, 'change', function(){
                self._onAjax();
            });
        },
        _onAjax: function () {
            if(this.opts.beforeUpload !== null && typeof this.opts.beforeUpload === 'function')this._ajaxFileInfo();
            this._ajaxFormData();
        },
        _ajaxFileInfo: function () {
            var file = this.fileInput.files,
                self = this,
                fileInfo = [],
                imageType = /^image\//;

            for (var i = 0, f; f = file[i]; i += 1) {
                if (file) {
                    var fileSize = 0;
                    if (f.size > 1024 * 1024) {
                        fileSize = (Math.round(f.size * 100 / (1024 * 1024)) / 100).toString() + 'MB'
                    } else {
                        fileSize = (Math.round(f.size * 100 / 1024) / 100).toString() + 'KB';
                    }
                }
                fileInfo[i] = {
                    name : f.name,
                    size : fileSize,
                    type : f.type
                };
                var fileReader = new FileReader();
                fileReader.onload = (function(file,index){
                    return function (){
                        if (imageType.test(file.type)) {
                            fileInfo[index].img = this.result;
                        }
                        fileInfo.index = index;
                        self.opts.beforeUpload(fileInfo);
                    };
                }(f,i));
                fileReader.readAsDataURL(f);
            }
        },
        _ajaxFormData : function(){
            var fd  = new FormData(),
                file= this.fileInput.files,
                self= this;
            if(this.opts.data !== null && checkFile.file){
                for(var i = 0 ; i < this.opts.data.length ; i += 1){
                    for(var attr in this.opts.data[i]){
                        fd.append(attr, this.opts.data[i][attr]);
                    }
                }
            }
            for(var i = 0,f ; f = file[i] ; i += 1){
                fd.append(this.fileInput.getAttribute('name'),f);
                self._ajaxUpload(fd,self,i);
            }
        },
        _ajaxUpload : function(data,self,index){
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener('progress', function(event){
                self._ajaxProgress(event,index)
            }, false);
            xhr.addEventListener('load', function(event){
                self._ajaxLoad(event,index)
            }, false);
            xhr.addEventListener('error', function(){
                console.log('error');
            }, false);
            xhr.addEventListener('abort', function(){
                console.log('abort')
            }, false);
            xhr.open('POST', this.opts.fileUploadUrl,true);
            xhr.send(data);
        },
        _ajaxProgress : function(event,index){
            if (event.lengthComputable) {
                var percentComplete = Math.round(event.loaded * 100 / event.total);
                if(typeof this.opts.progress === 'function' && this.opts.progress !== null)this.opts.progress(percentComplete,index);
            }
        },
        _ajaxLoad : function(event,index){
            if(event.target.readyState === 4  && event.target.status === 200){
                if(typeof this.opts.callback === 'function' && this.opts.callback !== null){
                    this.opts.callback(JSON.parse(event.target.responseText),index);
                }
            }else{
                console.log('error');
            }
        },
        _templateIFrame: function () {
            var inputHidden = '',
                iFrame,
                form,
                target = Hupload.utilKit.expando('iframe'),
                wrapper = Hupload.utilKit.createEl('div');
            this.iFrameExpando = Hupload.utilKit.expando('cacheID');
            if (this.opts.data !== null) {
                var l = this.opts.data.length;
                for (var i = 0; i < l; i += 1) {
                    for (var attr in this.opts.data[i]) {
                        inputHidden += '<input type="hidden" value="' + this.opts.data[i][attr] + '" name="' + attr + '"/>'
                    }
                }
            }
            iFrame = '<iframe name="' + target + '" id="' + Hupload.utilKit.expando("iframeId") + '" style="display: none;"></iframe>';
            form = '<form target="' + target + '" action="' + this.opts.fileUploadUrl + '" method="post" enctype="multipart/form-data">' + inputHidden + '</form>';
            wrapper.innerHTML = iFrame + form;
            wrapper.setAttribute('id', target);
            wrapper.setAttribute('style', 'display:"none;"');
            cacheID[this.iFrameExpando] = target;
            return wrapper;
        },
        _onIEChange: function () {
            var self = this,
                __onChangeUpload = Hupload.utilKit.bind(self, self._onChangeUpload);
            Hupload.utilKit.addEvent(self.fileInput, 'change', __onChangeUpload);
        },
        _onChangeUpload: function () {
            var wrapper = this.iFrameWrapper = this._templateIFrame();
            //if(this.opts.beforeUpload !== null && typeof this.opts.beforeUpload === 'function')this.opts.beforeUpload();
            Hupload.utilKit.append(wrapper);
            this.iFrameForm = Hupload.utilKit.$node(cacheID[this.iFrameExpando], 'form');
            this._exchangeFile();
            this._onLoadFrame();
        },
        _exchangeFile: function () {
            this.iFrameFileInput = this.fileInput.cloneNode(true);
            this.fileInput.style['display'] = 'none';
            this.fileInput.parentNode.appendChild(this.iFrameFileInput);
            Hupload.utilKit.append(this.iFrameForm, this.fileInput);
            this.iFrameForm.submit();
        },
        _removeFrame: function (node) {
            var self = this;
            this.iFrameTimer = setTimeout(function () {
                self.iFrameFileInput.parentNode.appendChild(self.fileInput);
                self.fileInput.style['display'] = 'inline';
                self.iFrameFileInput.parentNode.removeChild(self.iFrameFileInput);
                Hupload.utilKit.removeNode(node);
                cacheID[self.iFrameExpando] = '';
                clearTimeout(self.iFrameTimer);
            }, 100);
        },
        _onLoadFrame: function () {
            var _frame = Hupload.utilKit.$node(cacheID[this.iFrameExpando], 'iframe');
            var self = this;
            var __onLoadFrameFn = Hupload.utilKit.bind(self, self._onLoadFrameFn);
            Hupload.utilKit.addEvent(_frame, 'load', __onLoadFrameFn);
        },
        _onLoadFrameFn: function () {
            var _frame = Hupload.utilKit.$node(cacheID[this.iFrameExpando], 'iframe');
            if (this.opts.callback !== null && typeof this.opts.callback === 'function') {
                var data = JSON.parse(_frame.contentWindow.document.body.innerHTML);
                this.opts.callback(data);
            }
            this._removeFrame(this.iFrameWrapper);
        }
    };
    Hupload.utilKit = {
        $node: function () {
            var arg = [].slice.call(arguments);
            if (typeof arg[0] === 'string' && arg.length === 1) {
                return document.getElementById(arg[0]);
            } else if (typeof arg[1] === 'string') {
                var parent = document.getElementById(arg[0]),
                    child = parent.getElementsByTagName(arg[1]);
                return child[0];
            }
        },
        addEvent: function (el, type, fn, bubble) {
            if (el.addEventListener) {
                el.addEventListener(type, fn, !!bubble);
            } else if (el.attachEvent) {
                el.attachEvent('on' + type, fn);
            }
        },
        extend: function () {
            var arg = [].slice.call(arguments);

            if (typeof arg[0] !== 'object') {
                return arg[0];
            }
            if (this.isEmpty(arg[0])) {
                for (var attr in arg[1]) {
                    arg[0][attr] = this.extend(arg[1][attr]);
                }
                return arg[0];
            } else {
                for (var name in arg[1]) {
                    arg[0][name] = this.extend(arg[1][name]);
                }
            }
        },
        append: function () {
            var arg = [].slice.call(arguments);
            if (arg.length === 1) {
                document.body.appendChild(arg[0]);
            } else {
                arg[0].appendChild(arg[1]);
            }
        },
        removeNode: function (el) {
            document.body.removeChild(el);
        },
        createEl: function (str) {
            var arg = arguments[0];
            if (typeof arg === 'string') {
                return document.createElement(str);
            }
        },
        isEmpty: function (o) {
            for (var name in o) {
                return false
            }
            return true;
        },
        bind: function (self, fn) {
            return function () {
                fn.apply(self, arguments);
            }
        },
        expando: function (str) {
            return str + ('Hupload' + Math.random()).replace(/\D/g, "");
        }
    };
    Hupload.utilKit.extend(init.prototype, methodsUploadFile);

    return Hupload;
}));