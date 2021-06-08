import axios from 'axios';
import { AxiosRequestConfig, AxiosPromise } from 'axios';


interface JWTClient {
    readonly endpoint: string,
    token: string
}

export interface TokenRequest {
    readonly endpoint: string,
    readonly username: string,
    readonly password: string,
}

export interface PoolRequest extends AxiosRequestConfig {}

export class Client {        
    private readonly endpoint: string;
    public readonly token: string;

    constructor(credentials: JWTClient) {
        this.endpoint = credentials.endpoint;
        this.token = credentials.token;

        axios.defaults.baseURL = this.endpoint
        axios.defaults.headers.common['Authorization'] = this.token
        axios.defaults.headers.post['Content-Type'] = 'application/json';
    }

    static async fromCredentials(credentials: TokenRequest): Promise<Client> {
        let response = await axios.post(credentials.endpoint + '/account/token', { username: credentials.username, password: credentials.password });
        return new Client({endpoint: credentials.endpoint, token: response.data.token});
    }

    async self(): Promise<Account> {
        return new Account((await this.call<Account>({
            url: '/account',
            method: 'GET'
        })).data)
    }
}