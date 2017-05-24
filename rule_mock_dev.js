

global.api = "testapi";
global.apigroup="testapigroup";

module.exports = {

    summary:function(){
        return "replace response data by local response now";
    },

    //mark if use local response
    shouldUseLocalResponse : function(req,reqBody){
      try{
        //console.log("req.url is :" +req.url);
        var res=req.url.split('json?func=')[1];
        var useapi=res.split('&sid=')[0];
        //console.log("useapi is :" +useapi);
        global.apigroup=useapi.split('%3A')[0];
        console.log("apigroup is :" +global.apigroup);
      }
      catch(e){
        console.log("api pass");
      }

      var fs=require('fs')
      var msdata=fs.readFileSync('./conf/ms.json',"UTF-8");
      var ms = JSON.parse(msdata);
      var isOpen = ms['isOpen'];
      if (isOpen==0) {
        console.log("isOpen is :" +isOpen+",skip mock!");
        return false;
      };

      try{
          var apipath='./api/'+global.apigroup+'.txt';
          var file = fs.readFileSync(apipath,"utf8");
      }
      catch(e){
        console.log('apigroup "'+global.apigroup+'" is not exist! skip to mock_api');
        var file = fs.readFileSync('./api/mock_api.txt',"utf8");
      }

      //var file = fs.readFileSync('./api/mock_api.txt',"utf8");
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
            try{
              var datapath='./data/'+global.apigroup+'.json';
              var filetmp = fs.readFileSync(datapath,"utf8");
            }
            catch(e){
              console.log('mock_data_file"'+global.apigroup+'" is not exist! skip to mock_data');
              var datapath='./data/mock_data.json';
            }
            console.log('mock api is: '+global.api);//使用global对象访问到"全局"变量
            fs.readFile(datapath,function(err,data){  
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