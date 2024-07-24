import json
import serial
import serial.tools.list_ports
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

class ArduinoConsumer(AsyncWebsocketConsumer):
    port = None
    ser = serial.Serial()
    is_streaming = False

    async def connect(self):
        await self.accept()
        await self.find_and_connect_port()

    async def disconnect(self, close_code):
        await self.close_serial()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        command = text_data_json['command']

        if command == 'disconnect':
            await self.close_serial()
        elif command == 'start':
            self.is_streaming = True
            await self.send(json.dumps({
                'type': 'stream_status',
                'status': 'started'
            }))
            await self.start_streaming()
        elif command == 'stop':
            await self.stop_streaming()

    @sync_to_async
    def find_and_connect_port(self):
        self.ser.baudrate = 115200
    
        ports = serial.tools.list_ports.comports()
        for port in ports:
            try:
                self.ser.port = port.device
                self.ser.open()
                self.ser.write(b'TEST\n')
                time.sleep(1)
                response = self.ser.readline().strip()
                if response:
                    self.port = port
                    break
                self.ser.close()
            except (OSError, serial.SerialException):
                pass
    
        if self.port:
            return self.port.description
        return None

    async def close_serial(self):
        await self.stop_streaming()
        if self.ser.is_open:
            await sync_to_async(self.ser.close)()

    async def start_streaming(self):
        if not self.ser.is_open:
            port_desc = await self.find_and_connect_port()
            if port_desc:
                await self.send(json.dumps({
                    'type': 'port_detected',
                    'port': port_desc
                }))
            else:
                await self.send(json.dumps({
                    'type': 'error',
                    'message': 'No port found'
                }))
                return
        
        while self.is_streaming and self.ser.is_open:
            try:
                data = await self.read_serial()
                await self.send(json.dumps({
                    'type': 'serial_data',
                    'data': data
                }))
            except Exception as e:
                await self.send(json.dumps({
                    'type': 'error',
                    'message': str(e)
                }))
                break

        if not self.is_streaming:
            await self.send(json.dumps({
                'type': 'stream_status',
                'status': 'stopped'
            }))

    @sync_to_async
    def read_serial(self):
        return self.ser.readline().decode('utf-8').strip()

    async def stop_streaming(self):
        print('stopping')
        self.is_streaming = False
        await self.send(json.dumps({
            'type': 'stream_status',
            'status': 'stopped'
        }))