const GLOBAL_INSTRUCTIONS = `Always respond in the same language the customer uses.`;

export function buildSystemPrompt(agentPrompt: string): string {
  return `${agentPrompt}\n\n${GLOBAL_INSTRUCTIONS}`;
}
