const request = require('supertest')
const server = require('../index.js')

beforeAll(async () => {
  console.log('Jest starting!')
})

afterAll(() => {
  server.close()
  console.log('server closed!')
})

describe('teste1', () => {
  test('download', async () => {
    const response = await request(server).post('/split-pdf')

    expect(response.status).toEqual(200)
    // expect(response.text).toContain('Hello World!')
  })
})
