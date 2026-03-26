export type MessageRecord = {
  id: number;
  messageId: string;
  messageType: string;
  correlationId: string;
  queueName: string;
  exchangeName?: string;
  routingKey?: string;
  messageBody: string;
  consumerService?: string;
  consumerIp?: string;
  consumeTime: string;
  consumeStatus?: number | null;
  retryCount?: number;
  errorMsg?: string;
  createTime: string;
  updateTime: string;
};
