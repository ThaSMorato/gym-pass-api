import { PrismaGymsRepository } from '@/repositories/prisma/prisma-gyms-repository'
import { CreateGymUseCase } from '../create-gym'

export function makeCreateGymUseCase() {
  const prismaRepository = new PrismaGymsRepository()
  const useCase = new CreateGymUseCase(prismaRepository)

  return useCase
}
