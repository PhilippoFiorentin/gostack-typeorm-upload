import {
  getRepository,
  getCustomRepository,
  TransactionRepository,
} from 'typeorm';
// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactions = getCustomRepository(Transaction);

    const checkCategoryExists = await transactionsRepository.findOne(
      transactions.category_id,
    );

    if(checkCategoryExists)

    // const sameTransactionCategory = await transactionsRepository.findBySameCategory(
    //   transactionEntity,
    // );

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
