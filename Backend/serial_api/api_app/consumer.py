import json
import asyncio
import serial
import serial.tools.list_ports
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

class ArduinoConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.port = None
        self.ser = serial.Serial()
        self.stream_task = None

    async def connect(self):
        await self.accept()
        await self.find_and_connect_port()

    async def disconnect(self, close_code):
        await self.stop_streaming()
        await self.close_serial()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        command = text_data_json['command']

        if command == 'disconnect':
            await self.stop_streaming()
            await self.close_serial()
        elif command == 'start':
            await self.start_streaming()
        elif command == 'stop':
            await self.stop_streaming()

    async def find_and_connect_port(self):
        self.ser.baudrate = 115200
        ports = await sync_to_async(serial.tools.list_ports.comports)()
        for port in ports:
            try:
                self.ser.port = port.device
                await sync_to_async(self.ser.open)()
                await sync_to_async(self.ser.write)(b'TEST\n')
                await asyncio.sleep(1)
                response = await sync_to_async(self.ser.readline)()
                if response.strip():
                    self.port = port
                    await self.send(json.dumps({
                        'type': 'port_detected',
                        'port': port.description
                    }))
                    return
                await sync_to_async(self.ser.close)()
            except (OSError, serial.SerialException):
                pass
        
        await self.send(json.dumps({
            'type': 'error',
            'message': 'No responsive port found'
        }))

    async def start_streaming(self):
        if not self.ser.is_open:
            await self.find_and_connect_port()
        
        if self.ser.is_open:
            self.stream_task = asyncio.create_task(self.stream_data())
            await self.send(json.dumps({
                'type': 'stream_status',
                'status': 'started'
            }))

    async def stop_streaming(self):
        if self.stream_task:
            self.stream_task.cancel()
            try:
                await self.stream_task
            except asyncio.CancelledError:
                pass
            self.stream_task = None
        await self.send(json.dumps({
            'type': 'stream_status',
            'status': 'stopped'
        }))

    async def stream_data(self):
        while True:
            try:
                data = await sync_to_async(self.ser.readline)()
                await self.send(json.dumps({
                    'type': 'serial_data',
                    'data': data.decode('utf-8').strip()
                }))
            except asyncio.CancelledError:
                break
            except Exception as e:
                await self.send(json.dumps({
                    'type': 'error',
                    'message': str(e)
                }))
                break

    async def close_serial(self):
        if self.ser.is_open:
            await sync_to_async(self.ser.close)()