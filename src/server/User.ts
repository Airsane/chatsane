import {Socket} from "socket.io";
import NodeRSA from "node-rsa";

export default class User {
    public socket: Socket;
    private key: NodeRSA | null = null;
    private username: string = "";

    constructor(socket: Socket) {
        this.socket = socket;
    }

    public setUsername(username: string) {
        this.username = username;
    }

    public getUsername(): string {
        return this.username;
    }

    public getId(): string {
        return this.socket.id;
    }

    public setKey(key: string) {
        this.key = new NodeRSA(key);
    }

    public getKey(): NodeRSA {
        if (!this.key) {
            throw new Error("No key set");
        }
        return this.key;
    }

}