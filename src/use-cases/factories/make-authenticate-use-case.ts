import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { AuthenticateUseCase } from '../authenticate'

export function makeAuthenticateUseCase() {
  const prismaRepository = new PrismaUsersRepository()
  const useCase = new AuthenticateUseCase(prismaRepository)

  return useCase
}
