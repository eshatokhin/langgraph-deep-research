import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const MOCK_CUSTOMERS: Record<
  string,
  { name: string; hasActiveSupport: boolean }
> = {
  '12345678': { name: 'ТОВ "Ромашка"', hasActiveSupport: true },
  '87654321': { name: 'ФОП Іваненко І.І.', hasActiveSupport: false },
};

export const checkCustomerTool = tool(
  ({ edrpou }) => {
    const customer = MOCK_CUSTOMERS[edrpou];

    if (!customer) {
      return JSON.stringify({ found: false });
    }

    return JSON.stringify({
      found: true,
      edrpou,
      name: customer.name,
      hasActiveSupport: customer.hasActiveSupport,
    });
  },
  {
    name: 'check_customer',
    description:
      'Перевіряє чи існує клієнт в базі даних за ЄДРПОУ та чи є у нього активний договір на підтримку',
    schema: z.object({
      edrpou: z.string().describe('ЄДРПОУ компанії клієнта — 8 цифр'),
    }),
  },
);
