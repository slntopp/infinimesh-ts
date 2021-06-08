import { Client, TokenRequest } from "./client"
import { Account } from "./account"

import * as mocha from "mocha"
import * as chai from "chai"

const expect = chai.expect

const real_credentials = {
  endpoint: process.env.INF_API_URL,
  username: process.env.INF_USERNAME,
  password: process.env.INF_PASSWORD,
} as TokenRequest

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

function randomString(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

describe("Testing infinimesh::Client", () => {

  describe("Authorization", () => {
    it('Should be able to login and get token', async () => {
      let client = await Client.fromCredentials(real_credentials)
      expect(client.token).to.be.a('string')
    })
    it('Token must hold account id and it to be correct', async () => {
      let client = await Client.fromCredentials(real_credentials)
      expect(parseJwt(client.token).account_id).to.equal(process.env.INF_USER_ID)
    })
  })
  describe("Dev cases", async () => {
    let self: Account;
    let client: Client;

    let user: Account;
    let user_client: Client;
    let user_id: string;
    let user_credentials: TokenRequest;

    before(async function() {
      client = await Client.fromCredentials(real_credentials)
      user_credentials = {
        endpoint: real_credentials.endpoint,
        username: randomString() + "@testo.infinimesh.dev",
        password: randomString()
      }
    })
    it('Must obtain data about self as infinimesh::Account class', async () => {
      self = await client.self()
    })
    it('Must be able to create user', async () => {
      user_id = await Account.create({ username: user_credentials.username, password: user_credentials.password, is_admin: false, owner: self.uid }, client)
    })
    it('Must obtain data about new user as infinimesh::Account class', async () => {
      user = await Account.get(user_id, client)
    })
    it('Must not be able to login as new user, since not enabled', async () => {
      try {
        user_client = await Client.fromCredentials(user_credentials)
      } catch (err) {
        expect(err.response.status).to.equal(401)
      }

    })
    it('Test enabling user', async () => {
      await user.switch(client)
    })
    it('Must be able to login as new user, after enabled', async () => {
        user_client = await Client.fromCredentials(user_credentials)
    })
    it('Must obtain data about new user via self as infinimesh::Account class', async () => {
      let user_self = await user_client.self()
      expect(user.uid).to.equal(user_self.uid)
    })
    it('Test delete by owner', async () => {
      if(user.enabled)
        await user.switch(client)
      
      let delete_res = await user.delete(client)
      expect(delete_res, "Delete method works").to.equal(true)
      let get_res;
      try {
        get_res = await Account.get(user_id, client)
      } catch (err) {
        get_res = err.response.status
      }
      expect(get_res).to.equal(404)
    })
  })
})
