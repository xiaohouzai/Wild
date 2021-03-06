/**
 * Created by Hekx on 16/1/6.
 */
var fs   = require('fs');
var url  = require('url');
var util = require('util');
var querystring = require('querystring');
var formidable  = require('formidable');

var handlerEvent = {
    mapHandler : {},
    main  : function(req,res){
        fs.readFile('./index.html','utf-8',function(err,data){
            if (err) throw err;
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
        });
    },
    upload : function(req,res){
        if(req.method.toLowerCase() === 'post'){
            var form = new formidable.IncomingForm();
            form.encoding  = 'utf-8';
            form.uploadDir = 'file/';
            form.keepExtensions = true;
            form.parse(req,function(err,fields,files){

                var data = {
                    id   : fields.id,
                    name : files.upload.name,
                    success : null,
                    path  : 'file/' + files.upload.name,
                    isImg: false
                };

                if(err){
                    data.success = false;
                }else{
                    var ext   = files.upload.name.match(/(\.[^.]+|)$/)[0],
                        check = /jpg|png|gif/gi;
                    if(check.test(ext))data.isImg = true;
                    data.success = true;
                }
                fs.renameSync(files.upload.path, './file/'+ files.upload.name);
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(JSON.stringify(data));
                res.end();
                console.log("*---^上传成功^---* :  " + files.upload.name);
                //console.log(util.inspect({fields: fields, files: files}))
            })
        }else{
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('This is upload');
            res.end();
        }
        dataJson = [];
        countHttpRequest = 0;
    }
};
handlerEvent.mapHandler['/'] = handlerEvent.main;
handlerEvent.mapHandler['/upload'] = handlerEvent.upload;
module.exports = handlerEvent;