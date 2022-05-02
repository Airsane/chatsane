import {Server, Socket} from 'socket.io';
import NodeRSA from "node-rsa";
import User from "./server/User";
import UserCollection from "./server/UserCollection";

class ChatSaneServer {
    private io = new Server();
    private server!: Server;
    private key = new NodeRSA({b: 512});
    private users: UserCollection = new UserCollection();

    public start(port: number = 3000): void {
        this.server = this.io.listen(port);
        this.registerListeners();
        console.log(`Server started on port ${port}`);
    }

    private getUser(socket: Socket): User | null {
        const user = this.users.findUserById(socket.id);
        if (!user) {
            this.users.deleteUser(socket.id);
            socket.disconnect();
            return null;
        }
        return user;
    }

    private registerListeners() {
        this.server.on('connection', (socket) => {
            this.users.addUser(new User(socket));
            socket.emit('rsa-key', this.key.exportKey("public"));
            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
            socket.on('chatMessage', (encryptedData: Buffer) => {
                const sender = this.getUser(socket);
                if (!sender) {
                    return;
                }
                const data: {
                    username?: string,
                    message: string, timestamp: number
                } = JSON.parse(this.key.decrypt(encryptedData, 'utf8'));
                data.username = sender.getUsername();
                console.log(`Message received: ${data.message}`);
                this.users.getUsers().forEach((user) => {
                    ChatSaneServer.sendEncryptedMessage(user, JSON.stringify(data));
                });
            });

            socket.on('init', (data: { username: string }) => {
                const user = this.getUser(socket);
                if (!user) {
                    return;
                }
                user.setUsername(data.username);
                console.log(`User ${user.getUsername()} registered`);
            });

            socket.on('set-rsa-key', (key) => {
                const user = this.getUser(socket);
                if (!user)
                    return;
                user.setKey(this.key.decrypt(key.key, "utf8"));
            });
        });
    }

    private static sendEncryptedMessage(user: User, message: string) {
        user.socket.emit('chatMessage', user.getKey().encrypt(message));
    }
}

new ChatSaneServer().start();