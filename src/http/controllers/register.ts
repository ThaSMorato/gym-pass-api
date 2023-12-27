import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { RegisterUseCase } from '@/use-cases/register'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'

const registerBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const { body } = request
  const prismaRepository = new PrismaUsersRepository()
  const registerUseCase = new RegisterUseCase(prismaRepository)

  const { email, name, password } = registerBodySchema.parse(body)

  try {
    await registerUseCase.execute({ email, name, password })
  } catch (error) {
    return reply.status(409).send()
  }

  return reply.status(201).send()
}
