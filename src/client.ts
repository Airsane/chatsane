import {io, Socket} from 'socket.io-client';
import NodeRSA from "node-rsa";
import chalk from "chalk";
import * as readline from "readline";



class Client {
    private socket!: Socket;
    private serverKey!: NodeRSA;
    private userKey = new NodeRSA({b: 512});

    public start(): void {
        console.log('Client started');
        this.socket = io('http://localhost:3000');
        this.registerListeners();

    }

    private async registerListeners() {
        this.socket.on('rsa-key', async (data) => {
            this.serverKey = new NodeRSA(data);
            this.socket.emit('set-rsa-key', {key: this.serverKey.encrypt(this.userKey.exportKey('public'))});
            this.init();
            this.sendMessage("Hello World");
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.on('line', (line:string) => {
                Client.clearLastLine();
                this.sendMessage(line);
            });
        });

        this.socket.on('chatMessage', (data) => {
            const decrypted = JSON.parse(this.userKey.decrypt(data, 'utf8'));
            Client.printMessage(decrypted.timestamp,decrypted.username,decrypted.message);
        });
    }

    private init() {
        this.socket.emit('init', {username: `Test ${Math.floor(Math.random() * 20)}`});
    }

    private static clearLastLine() {
        process.stdout.moveCursor(0, -1) // up one line
        process.stdout.clearLine(1) // from cursor to end
    }

    private sendMessage(message: string) {
        const data = {message, timestamp: new Date().getTime()};
        const encrypted = this.serverKey.encrypt(JSON.stringify(data));

        this.socket.emit('chatMessage', encrypted);
    }

    private static printMessage(timestamp: number, username: string, message: string) {
        const date = new Date(timestamp);
        const formattedDate = chalk.green(`[${date.getHours() > 9 ? date.getHours() : '0'+date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0'+date.getMinutes()}:${date.getSeconds() > 9 ? date.getSeconds() : '0'+date.getSeconds()}]`);
        console.log(`${formattedDate}${username}: ${chalk.white(message)}`);
    }
}

new Client().start();