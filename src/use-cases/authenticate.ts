import { UsersRepository } from '@/repositories/users-repository'
import { compare } from 'bcryptjs'
import { User } from '@prisma/client'
import { IvalidCredentialsError } from './errors/invalid-credentials-errors'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

interface AuthenticateUseCaseResponse {
  user: User
}

export class AuthenticateUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new IvalidCredentialsError()
    }

    const doesPasswordsMathces = await compare(password, user.password_hash)

    if (!doesPasswordsMathces) {
      throw new IvalidCredentialsError()
    }

    return { user }
  }
}
