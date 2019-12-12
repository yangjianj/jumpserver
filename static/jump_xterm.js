var xterm;


var wsUrl = "ws://127.0.0.1:8080/server";
websocket = new WebSocket(wsUrl);//new 一个websocket实例
websocket.onopen = function (evt) {//打开连接websocket
    /*
    xterm = new xterminal({  //new 一个xterminal实例，就是数据展示的屏幕和一些见简单设置，包括屏幕的宽度，高度，光标是否闪烁等等
        cols: 200,
        rows: 80,
        screenKeys: true,
        useStyle: true,
        cursorBlink: true,
    });*/
    xterm = new Terminal({
        rendererType: "canvas", //渲染类型
        rows: 40, //行数
        convertEol: true, //启用时，光标将设置为下一行的开头
        scrollback:10,//终端中的回滚量
        disableStdin: false, //是否应禁用输入。
        cursorStyle: 'underline', //光标样式
        cursorBlink: true, //光标闪烁
        theme: {
          foreground: 'yellow', //字体
          background: '#060101', //背景色
          cursor: 'help',//设置光标
        }
      });
    console.log(xterm);
    /*xterm实时监控输入的数据，并且websocket把实时数据发送给后台*/
    xterm.open(document.getElementById('container-xterminal'));//屏幕将要在哪里展示，就是屏幕展示的地方
    xterm.write("Start xterminated");
    xterm.textarea.onkeydown = function (e) {
                console.log('User pressed key with keyCode: ', e.keyCode);
                //xterm.write(e);
                websocket.send(e.key);
                //console.log('编码',)
                //ws.send(that.encodeBase64Content(e.keyCode.toString()));
                //ws.send('bHM=');
              };

    xterm.attachCustomKeyEventHandler(function (e) {
                if (e.keyCode == 13) {
                  console.log('enter')
                   ws.send('DQ==')
                  return false;
                }});

    xterm.onData('data', function (data) {
        xterm.write(data);
        websocket.send(data);//websocket发送给后台
    });


    websocket.onmessage = function (evt) {//接受到数据
        xterm.write(evt.data);//把接收的数据写到这个插件的屏幕上
    }
    websocket.onclose = function (evt) {//websocket关闭
        xterm.write("Session xterminated");
        xterm.destroy();//屏幕关闭
    }
    websocket.onerror = function (evt) {//失败额处理
        if (typeof console.log == "function") {
            console.log(evt)
        }
    }
}

var close = function () {//关闭websocket
    websocket.close();
};
