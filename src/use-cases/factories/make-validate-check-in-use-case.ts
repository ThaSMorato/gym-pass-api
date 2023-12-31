import { PrismaCheckInsRepository } from '@/repositories/prisma/prisma-check-ins-repository'
import { ValidateCheckInUseCase } from '../validate-check-in'

export function makeValidateCheckInUseCase() {
  const prismaRepository = new PrismaCheckInsRepository()
  const useCase = new ValidateCheckInUseCase(prismaRepository)

  return useCase
}
