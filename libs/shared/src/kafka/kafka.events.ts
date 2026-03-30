export type CloudEvent<T> = {
  id: string;
  source: string;
  type: string;
  time: string;
  data: T;
};

export type CardRequestedEventData = {
  requestId: string;
  forceError: boolean;
};

export type CardRequestedDlqEventData = {
  reason: string;
  attempts: number;
  payload: CardRequestedEventData;
};

export type CardIssuedEventData = {
  requestId: string;
  status: 'issued';
  card: {
    id: string;
    processorCardReference: string;
    cardNumber: string;
    expirationDate: string;
    cvv: string;
    lastFour: string;
  };
};

export type CardRequestedEvent = CloudEvent<CardRequestedEventData>;
export type CardRequestedDlqEvent = CloudEvent<CardRequestedDlqEventData>;

export type CardIssuedEvent = CloudEvent<CardIssuedEventData>;
