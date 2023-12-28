import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { IvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-errors'
import { makeAuthenticateUseCase } from '@/use-cases/factories/make-authenticate-use-case'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { body } = request

  const authenticateUseCase = makeAuthenticateUseCase()

  const { email, password } = authenticateBodySchema.parse(body)

  try {
    await authenticateUseCase.execute({ email, password })
  } catch (error) {
    if (error instanceof IvalidCredentialsError) {
      return reply.status(400).send({ message: error.message })
    }
    throw error
  }

  return reply.status(200).send()
}
