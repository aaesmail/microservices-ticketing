import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

jest.mock('../events/nats-wrapper')
jest.mock('../stripe')

let mongo: MongoMemoryServer

beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf'

  mongo = await MongoMemoryServer.create()
  const mongoUri = mongo.getUri()

  mongoose.set('strictQuery', false)
  await mongoose.connect(mongoUri, {})
})

beforeEach(async () => {
  jest.clearAllMocks()

  const collections = await mongoose.connection.db.collections()

  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  if (mongo) {
    await mongo.stop()
  }

  await mongoose.connection.close()
})

declare global {
  var signin: (id?: string, email?: string) => string[]
}

global.signin = (id?: string, email = 'test@test.com') => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email,
  }

  const token = jwt.sign(payload, process.env.JWT_KEY!)

  const session = { jwt: token }

  const sessionJSON = JSON.stringify(session)

  const base64 = Buffer.from(sessionJSON).toString('base64')

  return [`session=${base64}`]
}
