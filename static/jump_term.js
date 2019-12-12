$(function () {

    $("#login").click(function () {
        /*
        if (websocket){
            websocket.close();
        }*/
        $("#container-terminal").empty();
        var fileds = $("#ff").serializeArray();  //form表单生成数组
        console.log(fileds);
        var data = {};
        $.each(fileds, function (index, filed) {  //数组转为json对象
                data[filed.name] = filed.value;
            }
        )
        console.log(JSON.stringify(data));
/*
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8080/submit',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),  //json数组
            dataType: 'json',
            success: function (data) {
                //var response = jQuery.parseJSON(data);
                if (data.status != 'ok') {
                    alert('input params error !')
                }
            },
            error: function (error) {
                console.log(error)
            }
        })

 */
    var term;
    var wsUrl = "ws://127.0.0.1:8080/server";
    websocket = new WebSocket(wsUrl);//new 一个websocket实例
    console.log(websocket);
    websocket.onopen = function (evt) {//打开连接websocket
        /*
        term = new Terminal({  //new 一个terminal实例，就是数据展示的屏幕和一些见简单设置，包括屏幕的宽度，高度，光标是否闪烁等等
            cols: 200,
            rows: 80,
            screenKeys: true,
            useStyle: true,
            cursorBlink: true,
        });*/
        websocket.send(JSON.stringify(data));
        term = new Terminal({
            cols: 100,
            rows: 40, //行数
            screenKeys: true,
            convertEol: true, //启用时，光标将设置为下一行的开头
            scrollback: 10,//终端中的回滚量
            disableStdin: false, //是否应禁用输入。
            cursorStyle: 'underline', //光标样式
            cursorBlink: true, //光标闪烁
            theme: {
                foreground: 'yellow', //字体
                background: '#060101', //背景色
                cursor: 'help',//设置光标
            }
        });
        console.log(term);
        /*term实时监控输入的数据，并且websocket把实时数据发送给后台*/
        term.open(document.getElementById('container-terminal'));//屏幕将要在哪里展示，就是屏幕展示的地方
        //term.write("Start terminated");

        term.on('data', function (data) {//term.on方法就是实时监控输入的字段，
            websocket.send(data);//websocket发送给后台
        });

        term.on('key', function (data) {//term.on方法就是实时监控输入的字段，
            //console.log(data);
            //websocket.send(data);//websocket发送给后台
        });
        term.on('title', function (title) {
                document.title = 'test-jump';
            }
        );

        websocket.onmessage = function (evt) {//接受到数据
            term.write(evt.data);//把接收的数据写到这个插件的屏幕上
        }
        websocket.onclose = function (evt) {//websocket关闭
            term.write("Session terminated");
            term.destroy();//屏幕关闭
        }
        websocket.onerror = function (evt) {//失败额处理
            if (typeof console.log == "function") {
                console.log(evt)
            }
        }
    }


        return false   //不重新加载页面
    })



    var close = function () {//关闭websocket
        websocket.close();
    };

})