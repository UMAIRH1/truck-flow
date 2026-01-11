export interface BankAccountErrors {
  fullName?: string;
  bank?: string;
  account?: string;
  swift?: string;
}

export interface CardDetailsErrors {
  name?: string;
  number?: string;
  expiry?: string;
  cvv?: string;
  zip?: string;
}

export function validateBankAccount(fullName: string, bank: string, account: string, swift: string): BankAccountErrors {
  const errors: BankAccountErrors = {};
  if (!fullName.trim()) errors.fullName = "Full name is required";
  if (!bank.trim()) errors.bank = "Bank name is required";
  if (!account.trim()) errors.account = "Account number is required";
  if (!swift.trim()) errors.swift = "Swift code is required";
  return errors;
}

export function validateCardDetails(name: string, number: string, expiry: string, cvv: string, zip: string): CardDetailsErrors {
  const errors: CardDetailsErrors = {};
  if (!name.trim()) errors.name = "Name on card is required";
  const cleanNumber = number.replace(/\s/g, "");
  if (!/^\d{16}$/.test(cleanNumber)) errors.number = "Card number must be 16 digits";
  if (!/^\d{2}\/\d{2}$/.test(expiry)) errors.expiry = "Expiry must be in MM/YY format";
  if (!/^\d{3,4}$/.test(cvv)) errors.cvv = "CVV must be 3 or 4 digits";
  if (!zip.trim()) errors.zip = "ZIP code is required";
  return errors;
}
