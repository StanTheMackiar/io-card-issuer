export type CloudEvent<T> = {
  id: string;
  source: string;
  type: string;
  time: string;
  data: T;
};

export type CardRequestedEventData = {
  requestId: string;
  status: 'pending';
  customer: {
    documentType: 'DNI';
    documentNumber: string;
    fullName: string;
    age: number;
    email: string;
  };
  product: {
    type: 'VISA';
    currency: 'PEN' | 'USD';
  };
  forceError: boolean;
};

export type CardIssuedEventData = {
  requestId: string;
  status: 'issued';
  card: {
    id: string;
    processorCardReference: string;
    lastFour: string;
  };
};

export type CardRequestedEvent = CloudEvent<CardRequestedEventData>;

export type CardIssuedEvent = CloudEvent<CardIssuedEventData>;
