import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { RegisterUseCase } from '../register'

export function makeRegisterUseCase() {
  const prismaRepository = new PrismaUsersRepository()
  const registerUseCase = new RegisterUseCase(prismaRepository)

  return registerUseCase
}
