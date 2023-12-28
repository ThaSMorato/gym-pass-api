import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { AuthenticateUseCase } from '../authenticate'

export function makeAuthenticateUseCase() {
  const prismaRepository = new PrismaUsersRepository()
  const authenticateUseCase = new AuthenticateUseCase(prismaRepository)

  return authenticateUseCase
}
