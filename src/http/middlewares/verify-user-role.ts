import { FastifyReply, FastifyRequest } from 'fastify'

type Role = 'ADMIN' | 'MEMBER'

export function verifyUserRole(roleToVerify: Role) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { role: userRole } = request.user

    if (userRole !== roleToVerify) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
  }
}
