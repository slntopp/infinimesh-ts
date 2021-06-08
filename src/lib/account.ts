import { Client } from "./client"

interface IAccountBase {
  name?: string
  username: string
  is_admin: boolean
  password: string
  owner?: string
}

export interface IAccount {
  readonly uid: string
  username: string
  name: string
  is_root: boolean
  is_admin: boolean
  enabled: boolean
  owner?: string
}

export class Account implements IAccount {
  readonly uid: string
  username: string
  name: string
  is_root: boolean
  is_admin: boolean
  enabled: boolean
  owner?: string

  constructor(acc: IAccount) {
    this.uid = acc.uid
    this.username = acc.username
    this.name = acc.name
    this.is_root = acc.is_root
    this.is_admin = acc.is_admin
    this.enabled = acc.enabled
    this.owner = acc.owner
  }

  static async create(account: IAccountBase, client: Client): Promise<string> {
    if (!account.name) {
      account.name = account.username
    }
    return (await client.call<Account>({
      url: '/accounts',
      method: 'POST',
      data: {
        account: account
      }
    })).data.uid
  }
  static async get(uid: string, client: Client): Promise<Account> {
    return new Account((await client.call<Account>({
      url: '/accounts/' + uid,
      method: 'GET'
    })).data)
  }

  async switch(client: Client): Promise<boolean> {
    await Account.switch(this.uid, !this.enabled, client)
    return this.enabled = !this.enabled
  }
  static async switch(uid: string, enabled: boolean, client: Client) {
    await client.call({
      url: '/accounts/' + uid,
      method: 'PATCH',
      data: {
        enabled: enabled
      }
    })
  }

  async delete(client: Client): Promise<boolean> {
    await Account.delete(this.uid, client)
    return true
  }
  static async delete(uid: string, client: Client) {
    await client.call({
      url: '/accounts/' + uid,
      method: 'DELETE'
    })
  }
}