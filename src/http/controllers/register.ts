import { prisma } from '@/lib/prisma'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { hash } from 'bcryptjs'

const registerBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const { body } = request

  const { email, name, password } = registerBodySchema.parse(body)

  const userWithSameEmail = await prisma.user.findUnique({
    where: { email },
  })

  if (userWithSameEmail) {
    return reply.status(409).send()
  }

  const passwordHash = await hash(password, 6)

  await prisma.user.create({
    data: {
      email,
      name,
      password_hash: passwordHash,
    },
  })

  return reply.status(201).send()
}
