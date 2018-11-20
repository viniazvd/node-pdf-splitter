const request = require('supertest')
const server = require('../index.js')

beforeAll(async () => {
  console.log('Jest starting!')
})

afterAll(() => {
  server.close()
  console.log('server closed!')
})

describe('testes', () => {
  test('check status', () => {
    const body = {
      file: 'engenharia',
      names: ['MATEUS FERNANDES SILVA LIMA', 'DOUGLAS ALMEIDA SILVA']
    }
    request(server)
      .post('/split-pdf')
      .send(body)
      .expect(200)
  })
})
