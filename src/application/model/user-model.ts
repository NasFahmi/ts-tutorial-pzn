
/**
 * request body ketika create user
 * request body memiliki format
 * {
 *  'username':'testusername',
 *  'password':'testpass',
 *  'name' : 'testname'
 * }
 * user response ketika berhasil create user
 * {
 *  'username':'testusername',
 *  'password':'testpass',
 *  'token' : 'token'->opsional
 * }
 * semua info tedapat pada doc user
 *  */

// register user response 
export type CreateUserRequest = {
    username: string;
    password: string;
    name: string;
}

// succes create User response
export type SuccessCreateUserResponse = {
    username: string;
    name: string;
}

// failed create user response
// export type FailedCreateUserResponse = {
//     errors: string
// }

//Login

//login user request
export type loginUserRequest = {
    username: string;
    password: string;
}

//success login user response
export type SuccessLoginUserResponse = {
    username: string;
    password: string;
    accesToken: string;
    refreshToken: string;
}

// failed login user response
// export type FailedLoginUserResponse = {
//     errors: string
// }


//karena error semuanya sama maka akan dibuat 1 type
export type ErrorResponse = {
    errors: string
}
//Get User

export interface GetUserRequestHeaders {
    'X-API-TOKEN': string;
}

export type GetUserResponse = {
    username: string;
    name: string;
}

export type UpdateUserRequest = {
    password: string;
    name: string;
}

export type SuccessUpdateUserResponse = {
    username: string;
    name: string;
}

export type LogoutUserResponse = {
    message: string
}

export interface payload {
    sub: string,
    name: string,
    jti: string,  // Unique identifier for this token
    iat: number,
}