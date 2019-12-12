# -*- coding: utf-8 -*-
from flask_cors import *
import json,time
from flask import Flask,request
from geventwebsocket.handler import WebSocketHandler
from gevent.pywsgi import WSGIServer
from gevent import monkey
from paramiko_ssh import Ssh
import config as CONFIG

monkey.patch_all()  #遇到阻塞自动切换协程，程序启动时执行
app= Flask(__name__)
CORS(app,resources={r'/*':{"origins": "*"}})

@app.route("/")
def index():
    return '<h1> hello flask !</h1>'

@app.route("/get_json")
def get_json():
    response = {"status":"ok","data":[]}
    return json.dumps(response)

@app.route("/server1")
def server1():
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        while(1):
            receive = ws.receive()
            response = {"status": "ok", "line": 'll',"markpoint":None}  #发送路径信息给前端
            response = json.dumps(response)
            ws.send(receive)
    else:
        return {"status": "error", "message": "request is not websocket"}

@app.route("/server")
def server():
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        msg = ws.receive()
        msg = json.loads(msg)
        print(msg["ip"])
        s1 = Ssh('10.124.128.97', 22)
        s1.login('F1335883', 'yj123456')
        s1.websocket_io(ws)
        return "connection closed"
    else:
        return {"status": "error", "message": "request is not websocket"}


if __name__=="__main__":
    #app.run(host='0.0.0.0', port=8080, debug=True)
    print("start WSGIServer enter Ctrl+c exit")
    http_server = WSGIServer(('0.0.0.0', 8080), app, handler_class=WebSocketHandler)
    http_server.serve_forever()