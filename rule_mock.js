

global.api = "testapi";
module.exports = {

    summary:function(){
        return "replace response data by local response now";
    },

    //mark if use local response
    shouldUseLocalResponse : function(req,reqBody){
      //console.log("req.url is :" +req.url);
      var fs=require('fs')
      var msdata=fs.readFileSync('./conf/ms.json',"UTF-8");
      var ms = JSON.parse(msdata);
      var isOpen = ms['isOpen'];
      if (isOpen==0) {
        console.log("isOpen is :" +isOpen+",skip mock!");
        return false;
      };
      var file = fs.readFileSync('./api/mock_api.txt',"utf8");
      var apilist = [];
      apilist=file.split(/\r?\n/ig);
      for (var i = 0;  i < apilist.length; i++) {
        var mockapi=apilist[i];
        if(new RegExp(mockapi).test(req.url)){
          global.api=mockapi
          return true;
          }
        };
      return false;  
    },

    dealLocalResponse : function(req,reqBody,callback){
            var fs=require('fs');
            console.log('mock api is: '+global.api);//使用global对象访问到"全局"变量
            fs.readFile('./data/mock_data.json',function(err,data){  
                if(err)  
                    throw err;     
                var arr = JSON.parse(data);
                try{
                  var respon=arr[global.api];
                  console.log("status  :" + respon.status);
                  console.log("headers  :" + JSON.stringify(respon.headers));
                  console.log("body  :" + JSON.stringify(respon.body));
                  var newDataStr=JSON.stringify(respon.body);
                  callback(respon.status,respon.headers,newDataStr);
                }

                catch(e){
                  console.log(e);
                  console.log("you should go to set mock data for api: "+global.api);
                }
            })
        
    }
};