import { CheckIn } from '@prisma/client'
import { CheckInsRepository } from '@/repositories/check-ins-repository'

interface FechUserCheckInHistoryUseCaseRequest {
  userId: string
  page: number
}

interface FechUserCheckInHistoryUseCaseResponse {
  checkIns: CheckIn[]
}

export class FechUserCheckInHistoryUseCase {
  constructor(private checkinsRepository: CheckInsRepository) {}

  async execute({
    userId,
    page,
  }: FechUserCheckInHistoryUseCaseRequest): Promise<FechUserCheckInHistoryUseCaseResponse> {
    const checkIns = await this.checkinsRepository.findManyByUserId(
      userId,
      page,
    )

    return { checkIns }
  }
}
