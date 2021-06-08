import axios from 'axios';
import { AxiosInstance, AxiosRequestConfig, AxiosPromise } from 'axios';

import { Account } from './account';

interface JWTClient {
    readonly endpoint: string,
    token: string
}

export interface TokenRequest {
    readonly endpoint: string,
    readonly username: string,
    readonly password: string,
}

export class Client {        
    private readonly endpoint: string;
    public readonly token: string;
    private axios: AxiosInstance;

    constructor(credentials: JWTClient) {
        this.endpoint = credentials.endpoint;
        this.token = credentials.token;

        this.axios = axios.create({
            baseURL: this.endpoint,
            headers: {
                Authorization: "Bearer " + this.token,
                "Content-Type": 'application/json'
            }
        })
    }

    static async fromCredentials(credentials: TokenRequest): Promise<Client> {
        let response = await axios.post(credentials.endpoint + '/account/token', { username: credentials.username, password: credentials.password });
        return new Client({endpoint: credentials.endpoint, token: response.data.token});
    }

    call<Type>(request: AxiosRequestConfig): AxiosPromise<Type> {
        return this.axios(request)
    }

    async self(): Promise<Account> {
        return new Account((await this.call<Account>({
            url: '/account',
            method: 'GET'
        })).data)
    }
}