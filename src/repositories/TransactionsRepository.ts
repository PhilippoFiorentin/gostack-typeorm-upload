import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = this.find();

    const income = (await transactions)
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + Number(transaction.value), 0);

    const outcome = (await transactions)
      .filter(transaction => transaction.type === 'outcome')
      .reduce((sum, transaction) => sum + Number(transaction.value), 0);

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }

  public async findBySameCategory(
    category_id: string,
  ): Promise<Transaction | null> {
    const transactionCategory = await this.findOne({ where: { category_id } });

    return transactionCategory || null;
  }
}

export default TransactionsRepository;
