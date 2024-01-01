import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeValidateCheckInUseCase } from '@/use-cases/factories/make-validate-check-in-use-case'

const validateCheckInsParamsSchema = z.object({
  checkInId: z.string().uuid(),
})

export async function validate(request: FastifyRequest, reply: FastifyReply) {
  const { params } = request

  const useCase = makeValidateCheckInUseCase()

  const { checkInId } = validateCheckInsParamsSchema.parse(params)

  await useCase.execute({
    checkInId,
  })

  return reply.status(204).send()
}
