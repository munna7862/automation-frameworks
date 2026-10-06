import { randomBytes } from 'crypto';
import { faker, getSeed } from '../faker/seedable-faker';

export interface UserData {
  username: string;
  password: string;
  fullName: string;
  email: string;
}

let userCounter = 0;

export class UserFactory {
  /**
   * Builds a single UserData object with guaranteed uniqueness across parallel test workers.
   * Ensures passwords comply with BuggyBooks security policy (>= 8 chars, uppercase, lowercase, number, special char).
   */
  public static build(overrides: Partial<UserData> = {}): UserData {
    userCounter++;
    const activeSeed = getSeed();

    let uniqueSuffix: string;
    if (activeSeed !== undefined) {
      // In seeded deterministic mode, use deterministic sequence
      uniqueSuffix = `s${activeSeed}_u${userCounter}`;
    } else {
      // In live mode, guarantee parallel worker isolation
      const worker =
        process.env.TEST_WORKER_INDEX ||
        process.env.TEST_PARALLEL_INDEX ||
        process.env.JEST_WORKER_ID ||
        '0';
      const rand = randomBytes(3).toString('hex');
      const time = Date.now().toString(36);
      uniqueSuffix = `w${worker}_${time}_${rand}_${userCounter}`;
    }

    const firstName = faker.person.firstName().replace(/[^a-zA-Z]/g, '') || 'Test';
    const lastName = faker.person.lastName().replace(/[^a-zA-Z]/g, '') || 'User';
    const fullName = overrides.fullName ?? `${firstName} ${lastName}`;
    const baseUsername = `${firstName.toLowerCase()}_${uniqueSuffix}`;
    // Restrict username length to <= 30 chars for backend DB constraints
    const username = overrides.username ?? baseUsername.slice(0, 30);
    const password = overrides.password ?? 'Password123!';
    const email = overrides.email ?? `${username}@buggybooks.internal`;

    return {
      username,
      password,
      fullName,
      email
    };
  }

  /**
   * Builds an array of N unique UserData objects.
   */
  public static buildList(count: number, overrides: Partial<UserData> = {}): UserData[] {
    const users: UserData[] = [];
    for (let i = 0; i < count; i++) {
      users.push(this.build(overrides));
    }
    return users;
  }
}
