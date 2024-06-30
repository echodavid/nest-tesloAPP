import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface connectedClients {
    [id: string]: {
        client: Socket,
        user: User
    
    }
}

@Injectable()
export class MessagesWsService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    private connectedClients = {}

    async regiterClient(client: Socket, userId: string) {
        const user = await this.userRepository.findOneBy({id:userId});
        if(!user)
            throw new Error('User not found');
        if(!user.isActive)
            throw new Error('User is not active');

        this.checkUserConnected(user);
        
        this.connectedClients[client.id] = {
            client,
            user
        };
    }

    removeClient(clientId: string) {
        delete this.connectedClients[clientId];
    }

    
    getConnectedClients(): string[] {
        console.log(this.connectedClients);
        return Object.keys(this.connectedClients);
    }

    getUserFullName(socketId: string) {
        console.log(this.connectedClients[socketId].user.fullName);
        return this.connectedClients[socketId].user.fullName;
    }

    private checkUserConnected(user: User) {
        for(const clientID of Object.keys(this.connectedClients)) {
            const connectedClient = this.connectedClients[clientID];
            if(connectedClient.user.id === user.id){
                connectedClient.client.disconnect();
                break;
            }
        }
    }
}
