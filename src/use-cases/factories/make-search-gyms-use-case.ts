import { PrismaGymsRepository } from '@/repositories/prisma/prisma-gyms-repository'
import { SearchGymsUseCase } from '../search-gyms'

export function makeSearchGymsUseCase() {
  const prismaRepository = new PrismaGymsRepository()
  const useCase = new SearchGymsUseCase(prismaRepository)

  return useCase
}
