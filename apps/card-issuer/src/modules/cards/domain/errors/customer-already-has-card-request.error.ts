export class CustomerAlreadyHasCardRequestError extends Error {
  constructor(documentNumber: string) {
    super(
      `Customer with document number ${documentNumber} already has a card request`,
    );
    this.name = CustomerAlreadyHasCardRequestError.name;
  }
}
