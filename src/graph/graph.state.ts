import { z } from 'zod';
import { StateSchema, MessagesValue } from '@langchain/langgraph';

export const SupportState = new StateSchema({
  messages: MessagesValue,
  edrpou: z.string().nullable().default(null),
  hasActiveSupport: z.boolean().nullable().default(null),
  issueCategory: z.string().nullable().default(null),
  issueDescription: z.string().nullable().default(null),
  ticketId: z.string().nullable().default(null),
  resolved: z.boolean().default(false),
});

export type SupportStateType = typeof SupportState.State;
export type SupportStateUpdate = typeof SupportState.Update;
