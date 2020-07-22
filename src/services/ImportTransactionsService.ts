import { getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'promise-fs';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const transactionsReadStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
    });

    const parseCSV = transactionsReadStream.pipe(parseStream);

    const transactions: TransactionCSV[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cells: string) =>
        cells.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const declaredCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const declaredCategoriesTitles = declaredCategories.map(
      (category: Category) => category.title,
    );

    const categoriesListOutBD = categories
      .filter(category => !declaredCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const addCategoriesOnBd = categoriesRepository.create(
      categoriesListOutBD.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(addCategoriesOnBd);

    const allCategoriesList = [...addCategoriesOnBd, ...declaredCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCategoriesList.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    await fs.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
