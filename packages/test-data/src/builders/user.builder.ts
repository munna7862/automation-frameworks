import { UserData, UserFactory } from '../factories/user.factory';

export interface CartItem {
  bookId: string;
  qty: number;
}

export interface UserWithCart extends UserData {
  cart: CartItem[];
}

export class UserBuilder {
  private userData: UserData;
  private cartItems: CartItem[] = [];

  constructor(initialOverrides: Partial<UserData> = {}) {
    this.userData = UserFactory.build(initialOverrides);
  }

  public withUsername(username: string): this {
    this.userData.username = username;
    return this;
  }

  public withPassword(password: string): this {
    this.userData.password = password;
    return this;
  }

  public withFullName(fullName: string): this {
    this.userData.fullName = fullName;
    return this;
  }

  public withEmail(email: string): this {
    this.userData.email = email;
    return this;
  }

  public withCart(items: CartItem[]): this {
    this.cartItems = [...items];
    return this;
  }

  public addCartItem(bookId: string, qty: number = 1): this {
    this.cartItems.push({ bookId, qty });
    return this;
  }

  public build(): UserWithCart {
    return {
      ...this.userData,
      cart: [...this.cartItems]
    };
  }
}
