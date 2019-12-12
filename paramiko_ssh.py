import time
import paramiko
import threading

class Ssh():
    def __init__(self,ip,port):
        self.ip = ip
        self.port =port
        self.username = ''
        self.password = ''
        self.transport = None
        self.channel = None
        self.th_list = []
        self.timeout = 60
        self._last_recv_time = None  #最近一次tunnel发出消息时间

    def login(self,username,password):
        self.username = username
        self.password = password
        self.transport = paramiko.Transport((self.ip, self.port))  # 实例化transport对象
        self.transport.connect(username=self.username, password=self.password)  # 建立连接
        self._open_channel()

    def _open_channel(self):
        self.channel = self.transport.open_session()  # 打开一个channel
        self.channel.settimeout(self.timeout)
        self.channel.get_pty()  # 打开远程的Terminal
        self.channel.invoke_shell()  # 激活terminal
        self._last_recv_time = time.time()

    def shell_io(self):
        th_in = threading.Thread(target=self.input_ssh, args=())
        th_out = threading.Thread(target=self.output_ssh, args=())
        self.th_list.append(th_in)
        self.th_list.append(th_out)
        for th in self.th_list:
            th.start()

        for th in self.th_list:
            th.join()

    def input_ssh(self):
        while(self.transport.active):
            input_str = input()     #阻塞程序
            if input_str == 'exit':
                self.transport.close()
                break
            input_str = input_str + "\n"
            self.channel.send(input_str)

    def output_ssh(self):
        while(self.transport.active):
            recive = self.channel.recv(65535).decode('utf-8')    #阻塞程序
            print(recive)

    def inbound_socket(self,websocket):
        #websocket发向ssh tunnel
        while (not websocket.closed):
            receive = websocket.receive()
            if receive != None:
                try:
                    self.channel.send(receive)
                except Exception as e:
                    websocket.send(str(e)+'\n')

    def outbound_socket(self,websocket):
        #ssh tunnel发向websocket
        try:
            while (self.transport.active and not websocket.closed):
                #print(self.channel.recv_stderr(65535).decode('utf-8'))
                websocket.send(self.channel.recv(65535).decode('utf-8'))
                self._last_recv_time = time.time()
        except Exception as e:
            print(e)
            websocket.send(str(e))

    def check_channel_timeout(self):
        #当channel已经超时时，channel.send（）不会报错，本方法检测是否超时，超时后主动关闭channel,transport
        while(time.time()-self._last_recv_time <self.timeout):
            time.sleep(1)
        self.channel.close()
        self.transport.close()

    def websocket_io(self,websocket):
        th_in = threading.Thread(target=self.inbound_socket, args=(websocket,))
        th_out = threading.Thread(target=self.outbound_socket, args=(websocket,))
        channel_timeout = threading.Thread(target=self.check_channel_timeout, args=())
        self.th_list.append(th_in)
        self.th_list.append(th_out)
        self.th_list.append(channel_timeout)
        for th in self.th_list:
            th.start()

        for th in self.th_list:
            th.join()

    def close(self):
        self.channel.close()
        self.transport.close()

if __name__ == '__main__':
    s1 = Ssh('10.124.128.97',22)
    #s1.login('root','Foxconn123')
    s1.login('F1335883', 'yj123456')
    s1.shell_io()


