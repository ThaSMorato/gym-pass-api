import { CheckIn } from '@prisma/client'
import { CheckInsRepository } from '@/repositories/check-ins-repository'

interface CheckInUseCaseRequest {
  userId: string
  gymId: string
}

interface CheckInUseCaseResponse {
  checkin: CheckIn
}

export class CheckInUseCase {
  constructor(private checkinsRepository: CheckInsRepository) {}

  async execute({
    gymId,
    userId,
  }: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {
    const checkin = await this.checkinsRepository.create({
      gym_id: gymId,
      user_id: userId,
    })

    return { checkin }
  }
}
