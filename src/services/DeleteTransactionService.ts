import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactionId = await transactionsRepository.findOne(id);

    if (!transactionId) {
      throw new AppError('Transaction id does not exist', 400);
    }

    await transactionsRepository.remove(transactionId);
  }
}

export default DeleteTransactionService;
