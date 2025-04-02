// external dependencies
import { ObjectId } from "mongodb";


//class implementation
export default class User {
    constructor(public name: string, public email: string, private password: string, public isAdmin: boolean, public id?: ObjectId) {}

}