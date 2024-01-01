import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFetchUserCheckInsHistoryUseCase } from '@/use-cases/factories/make-fetch-user-check-ins-history-use-case'

const checkInHistoryGymBodySchema = z.object({
  page: z.coerce.number().min(1).default(1),
})

export async function history(request: FastifyRequest, reply: FastifyReply) {
  const {
    query: q,
    user: { sub: userId },
  } = request
  const useCase = makeFetchUserCheckInsHistoryUseCase()

  const { page } = checkInHistoryGymBodySchema.parse(q)

  const { checkIns } = await useCase.execute({ page, userId })

  return reply.status(200).send({ checkIns })
}
