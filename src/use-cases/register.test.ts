import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'
import { UserAlreadyExistsError } from './errors/user-already-exists'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { mockedUserRepository } from '@/repositories/mock/mock-user-repository'

const user = {
  name: 'Jhon Doe',
  email: 'jhon@doe.com',
  password: '4_str0ng_p4ssw0rd',
}

const create = vi.fn().mockImplementation((data) => ({
  id: 'a_user_id_1',
  name: data.name,
  email: data.email,
  password_hash: data.password_hash,
  created_at: new Date(),
}))

const findByEmail = vi.fn()

const repository = {
  ...mockedUserRepository,
  create,
  findByEmail,
}

let inMemoryUserRepository: InMemoryUsersRepository
let sut: RegisterUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new RegisterUseCase(repository)
    })

    it('should hash user password upon registration', async () => {
      const { user: userResponse } = await sut.execute(user)

      const isPasswordCorrectlyHashed = await compare(
        user.password,
        userResponse.password_hash,
      )

      expect(isPasswordCorrectlyHashed).toBe(true)
    })

    describe('Create flow', () => {
      it('should call create function if the user is not already created', async () => {
        await sut.execute(user)

        expect(findByEmail).toBeCalledWith(user.email)
        expect(create).toBeCalledTimes(1)
      })

      it('should not call create and raise an error if user is already created', async () => {
        findByEmail.mockResolvedValue(user)

        try {
          await sut.execute(user)
        } catch (_) {
          expect(findByEmail).toBeCalledWith(user.email)
          expect(create).not.toBeCalled()
        }
      })
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryUserRepository = new InMemoryUsersRepository()
      sut = new RegisterUseCase(inMemoryUserRepository)
    })

    it('should not be able to register twice with the same email', async () => {
      await sut.execute(user)

      await expect(() =>
        sut.execute({
          name: 'Not Jhon Doe',
          email: user.email,
          password: 'not_the_same_password',
        }),
      ).rejects.toBeInstanceOf(UserAlreadyExistsError)
    })
    it('should be able to register', async () => {
      const { user: userResponse } = await sut.execute(user)

      expect(userResponse).toEqual(
        expect.objectContaining({
          name: user.name,
          email: user.email,
          id: expect.any(String),
        }),
      )
    })
  })
})
