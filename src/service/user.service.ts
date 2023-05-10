import { Injectable } from "@nestjs/common";
import { UserDao } from "src/auth/respository/UserDao";
import { UserModel } from "src/model";


@Injectable()
export class UserService {
    constructor(
        private readonly userDao:UserDao,
    ){}
    
   
    login = async (userId: string, password: string): Promise<UserModel | null> => {
     return null
    }
    logout = () => {
        
    }
   

}

