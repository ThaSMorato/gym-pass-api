import { FastifyInstance } from 'fastify'
import { register } from './controllers/register'
import { authenticate } from './controllers/authenticate'
import { profile } from './controllers/profile'
import { verifyJwt } from './middlewares/verifyJwt'

export async function appRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)

  // Autenticated
  // app.addHook('onRequest', verifyJwt)
  app.get('/me', { onRequest: verifyJwt }, profile)
}
