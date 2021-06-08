import { Client } from "./client"

import * as mocha from "mocha"
import * as chai from "chai"

const expect = chai.expect

const real_credentials = {
  endpoint: process.env.INF_API_URL,
  username: process.env.INF_USERNAME,
  password: process.env.INF_PASSWORD,
}

interface infinimeshTokenScheme {
  account_id: string,
  restricted: boolean,
  rules?: Array<any>
}

function parseJwt(token: string): infinimeshTokenScheme {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

describe("Testing infinimesh::Client, Auth cases", () => {
  it('Should be able to login and get token', async () => {
    let client = await Client.fromCredentials(real_credentials)
    expect(client.token).to.be.a('string')
  })
  it('Token must hold account id and it to be correct', async () => {
    let client = await Client.fromCredentials(real_credentials)
    expect(parseJwt(client.token).account_id).to.equal(process.env.INF_USER_ID)
  })
})