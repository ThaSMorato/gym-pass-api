import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { RegisterUseCase } from '../register'

export function makeRegisterUseCase() {
  const prismaRepository = new PrismaUsersRepository()
  const useCase = new RegisterUseCase(prismaRepository)

  return useCase
}
