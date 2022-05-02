import User from "./User";

export default class UserCollection {
    private users: User[]

    constructor() {
        this.users = [];
    }

    public addUser(user: User): void {
        this.users.push(user);
    }

    public deleteUser(id: string): void {
        this.users = this.users.filter(user => user.getId() !== id);
    }

    public getUsers(): User[] {
        return this.users;
    }

    public findUserById(id: string): User | undefined {
        return this.users.find(user => user.getId() === id);
    }

}