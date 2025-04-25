export interface RegisteredUserResponse {
    name: string;
    userId: string;
    newUser: boolean;
}

export interface UserInfoResponse {
    exists: boolean;
    name: string|undefined;
    userId: string|undefined;
}
