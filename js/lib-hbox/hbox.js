/**
 * Created by Hekx on 15/11/26.
 * support responsive and mobile
 * IE7+,FF,Chrome,Safari.
 */
;(function (window, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return factory.apply(window);
        })
    }
    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory.call(window);
    } else {
        window.hbox = factory.call(window);
    }
})(typeof global === 'object' ? global : window, function () {
    'use strict';

    var hbox = hbox || {};

    var utils = {
        client : function(){
            var ua = navigator.userAgent.toLowerCase();
            return {
                mobile : ua.match(/ipad/i) || ua.match(/iphone os/i) || ua.match(/android/i)
            };
        },
        replace : function(str){
           return str.replace(/^[^\d]*(\d+)[^\d]*$/, "$1");
        },
        log : function(el){
            if(window.console){
                console.log(el)
            }
        },
        createNode : function(node){
            if(node){
                return document.createElement(node);
            }
        },
        html : function(el,str){
            if(!el.innerHTML){
                el.innerHTML = str;
            }
        },
        append : function(el){
            document.body.appendChild(el);
        },
        remove : function(el){
            document.body.removeChild(el);
        },
        eventClick : function(el,fn,bubble){
            if (el.addEventListener) {
                el.addEventListener('click',fn,!!bubble);
            }
            else if (el.attachEvent) {
                el.attachEvent('onclick', function(){
                    fn.apply(el,arguments)
                });
            }
        },
        $class : function(id,klass){
            var els = [],
                elements = document.getElementById(id).getElementsByTagName('*'),
                i = 0,
                l = elements.length;
            if (arguments.length === 1){
                return document.getElementById(id);
            }
            for(; i < l ; i += 1){
                if(elements[i].className === klass){
                    els.push(elements[i]);
                }
            }
            return els;
        },
        getStyle : function(el,attr){
            if (el.currentStyle){
                return el.currentStyle[attr];
            }else if (window.getComputedStyle){
                return window.getComputedStyle(el,null)[attr];
            }
        },
        isEmpty : function(obj){
            for (var name in obj){
                return false;
            }
            return true;
        }
    };
    var configStyle = {
        ID : '',
        count : 0,
        shade : {
            position : 'fixed',
            top      : '0',
            left     : '0',
            width    : '100%',
            height   : '100%',
            backgroundColor : '#000000',
            opacity  : '.4',
            filter   : 'progid:DXImageTransform.Microsoft.Alpha(Opacity=40)'
        },
        parentBox : {
            position : 'fixed',
            left     : '50%',
            top      : '25%',
            width    : function(w){
                return w || 300 + 'px';
            },
            zIndex   : function(index){
                return 9999 + index;
            },
            className: function(klass){
                return klass;
            },
            id       : function(id){
                return id;
            }
        },
        style : {
            parent   : 'hbox',
            title    : 'hbox-title',
            content  : 'hbox-content',
            footer   : 'hbox-footer',
            button   : 'hbox-btn',
            _icon    : 'hbox-close-icon'
        }
    };
    var templateDom = {
        noTitle : function(){
            return '<div  class=' + configStyle.style.title +'><i data-id='+ configStyle.ID +' class='+ configStyle.style._icon +'></i></div>'
        },
        title   : function(str){
            return '<div class=' + configStyle.style.title +'><i data-id='+ configStyle.ID +' class='+ configStyle.style._icon +'></i><h4>'+ str +'</h4></div>';
        },
        content : function(str){
            return '<div class='+ configStyle.style.content +'>'+ str +'</div>'
        },
        footer  : function(btns){
            var btn = '';
            if(btns.length === 0){
                return btn;
            }else {
                for (var i  = 0; i < btns.length; i += 1){
                    btn += '<a data-id='+ configStyle.ID +' class="hbox-btn">'+ btns[i] +'</a>'
                }
                return '<div class='+ configStyle.style.footer +'>'+ btn +'</div>';
            }
        },
        iframe  : function(url){
            return '<div class='+ configStyle.style.content +'><iframe data-id='+ configStyle.ID +' src=' + url + '  frameborder="0" scrolling="auto" width="100%" height="100%">'+'</iframe></div>';
        }
    };
    var cacheData = {
        nodeParent : {},
        nodeShade  : {},
        mask       : {},
        iframe     : {},
        changeId   : ''
    };
    var HBox = function(opts){
        return new HBox.fn.init(opts);
    };
    HBox.fn = HBox.prototype;

    var init = HBox.fn.init = function(opts){
        var arg = Array.prototype.slice.call(arguments);
        this.configs = {
                style    : configStyle.style,
                id       : '',
                title    : '',
                content  : '',
                width    : null,
                height   : null,
                iframe   : false,
                url      : '',
                mask     : true,
                button   : [],
                callback : null,
                cssAnimation : ['pop'],
                repeat   : true
        };
        this.parent = utils.createNode('div');
        this.shade  = utils.createNode('div');
        for (var i in opts){
            if(this.configs.hasOwnProperty(i)){
                this.configs[i] = opts[i];
            }
        }
        return this;
    };
    init.prototype = HBox.fn;

    HBox.fn.copy = function(source,traget){
        for(var i in traget){
            source[i] = traget[i];
        }
        return source;
    };
    var methodsBox = {
        _setParentBox : function(){
            this.configs.id !== '' ? configStyle.ID = this.configs.id : configStyle.ID =  configStyle.style.parent + configStyle.count;
            for (var attr in configStyle.parentBox){
                if(typeof configStyle.parentBox[attr] === 'function'){
                    if(this.configs.width !== null && attr === 'width'){
                        this.parent.style[attr] = parseInt(configStyle.parentBox[attr](this.configs.width)) + 'px';
                        this.parent.style.marginLeft = '-' + (this.configs.width)/2 + 'px';
                    }else{
                        switch (attr){
                            case 'zIndex' :
                                this.parent.style[attr] = configStyle.parentBox[attr](configStyle.count);
                                break;
                            case 'className' :
                                this.parent[attr] = configStyle.parentBox[attr](configStyle.style.parent + ' ' + this.configs.cssAnimation[0]);
                                break;
                            case 'id' :
                                this.parent[attr] = configStyle.parentBox[attr](configStyle.ID);
                                break;
                            default :
                                this.parent.style[attr] = configStyle.parentBox[attr]();
                                this.parent.style.marginLeft = '-' + parseInt(configStyle.parentBox[attr]())/2 + 'px';
                                break;
                        }
                    }
                    continue;
                }
                this.parent.style[attr] = configStyle.parentBox[attr];
            }
            configStyle.count++;
        },
        _createBox : function(){
            this._setParentBox();
            utils.html(this.parent,this._createHtml(this.configs));
            utils.append(this.parent);
            if(this.configs.mask){
                utils.append(this._createShade());
                cacheData.nodeShade[configStyle.ID] = this.shade;
                cacheData.mask[configStyle.ID] = this.configs.mask;
            }else {
                cacheData.mask[configStyle.ID] = this.configs.mask;
            }
            if(this.configs.iframe !== false || this.configs.url !== ''){
                cacheData.iframe[configStyle.ID] = [this.configs.iframe ? this.configs.iframe : this.configs.url,configStyle.ID];
            }
            cacheData.nodeParent[configStyle.ID] = this.parent;
            cacheData.changeId = configStyle.ID;
            },
        _judge : function(){
            //TODO
            this._createBox();
            this._closeIcon();
        },
        /**
         *
         * @returns {*}
         * @private
         */
        _createShade : function(){
            var shade =  this.shade;
            for(var k in configStyle.shade)this.shade.style[k] = configStyle.shade[k];
            return shade;
        },
        _createHtml : function(opts){
            var title   = opts.title === ''? templateDom.noTitle():templateDom.title(opts.title);
            var content = opts.iframe !== false || opts.url !== '' ? templateDom.iframe(opts.url) : templateDom.content(opts.content);
            var footer  = templateDom.footer(opts.button);
            var template  = title + content + footer;
            return template;
        },
        _popBox : function(){
            var fn = [];
            this._judge();
            //callback
            for(var f in this.configs.callback)fn.push(f);
            if(this.configs.button.length !== 0 && fn.length === this.configs.button.length){
                var els = utils.$class(configStyle.ID,configStyle.style.button);
                for (var i = 0, l = this.configs.button.length; i< l;i += 1){
                    this._registerCall(els[i],i,fn);
                }
            }
        },
        _registerCall : function(el,index,fn){
            var that = this;
            utils.eventClick(el,function(){
                if(cacheData.changeId !== this.getAttribute('data-id')){
                    cacheData.changeId =  this.getAttribute('data-id');
                }
                that.configs.callback[fn[index]]();
            });
        },
        _closeIcon : function(){
            var closeIcon = utils.$class(configStyle.ID,configStyle.style._icon),
                that = this;
            utils.eventClick(closeIcon[0],function(){
                var dataID = this.getAttribute('data-id');
                utils.remove(cacheData.nodeParent[dataID]);
                cacheData.nodeParent[dataID] = 'undefined';
                if(that.configs.mask){
                    utils.remove(cacheData.nodeShade[dataID]);
                    cacheData.nodeShade[dataID] = 'undefined';
                }
                if(!utils.isEmpty(cacheData.iframe)){
                    cacheData.iframe[dataID] = 'undefined';
                }
            });
        },
        _closeBox : function(){
            var arg = arguments[0];
            if(typeof arg === 'string' && arg !== ''){
                utils.remove(cacheData.nodeParent[arg]);
                cacheData.nodeParent[arg] = 'undefined';
            }
            var localPrivate = cacheData.changeId;
            if(!utils.isEmpty(cacheData.iframe)){
                if(typeof cacheData.iframe[cacheData.changeId] === 'undefined'){
                    for (var i in cacheData.iframe){
                        if(cacheData.iframe[i] !== 'undefined'){
                            cacheData.changeId = i;
                        }
                    }
                }
                if(localPrivate !== cacheData.changeId){
                    utils.remove(cacheData.nodeParent[localPrivate]);
                    cacheData.nodeParent[localPrivate] = 'undefined';
                    if(cacheData.mask[localPrivate] !== false){
                        utils.remove(cacheData.nodeShade[localPrivate]);
                        cacheData.nodeShade[localPrivate] = 'undefined';
                    }
                }else{
                    utils.remove(cacheData.nodeParent[cacheData.changeId]);
                    cacheData.nodeParent[cacheData.changeId] = 'undefined';
                    if(cacheData.mask[cacheData.changeId] !== false){
                        utils.remove(cacheData.nodeShade[cacheData.changeId]);
                        cacheData.nodeShade[cacheData.changeId] = 'undefined';
                    }
                    cacheData.iframe[cacheData.changeId] = 'undefined';
                }
            }else{
                utils.remove(cacheData.nodeParent[cacheData.changeId]);
                cacheData.nodeParent[cacheData.changeId] = 'undefined';
                if(cacheData.mask[cacheData.changeId] !== false){
                    utils.remove(cacheData.nodeShade[cacheData.changeId]);
                    cacheData.nodeShade[cacheData.changeId] = 'undefined';
                }
            }
        }
    };
    HBox.fn.copy(init.prototype,methodsBox);
    hbox = {
        version : '1.0.0',
        open : function(cfg){
            HBox(cfg)._popBox();
        },
        close : function(){
            HBox()._closeBox();
        },
        fn : [],
        register : function(fn){
            if(Object.prototype.toString.call(fn) === '[object Function]'){
                this.fn.push(fn);
                return fn;
            }
        },
        require : function(arg){
            this.fn[0](arg);
        },
        msg  : function(){}
    };
    return hbox;
});