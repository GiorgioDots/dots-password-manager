export default class PasswordGenerator {
  // Default character sets
  private static readonly DEFAULT_UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly DEFAULT_LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  private static readonly DEFAULT_NUMBERS = '0123456789';
  private static readonly DEFAULT_SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  /**
   * Generate a secure random password
   *
   * @param config Configuration for password generation
   * @returns Randomly generated password
   */
  static generate(
    config: {
      length?: number;
      uppercase?: boolean | string;
      lowercase?: boolean | string;
      numbers?: boolean | string;
      specialChars?: boolean | string;
    } = {}
  ): string {
    // Default configuration
    const {
      length = 12,
      uppercase = true,
      lowercase = true,
      numbers = true,
      specialChars = true,
    } = config;

    // Resolve character sets
    const uppercaseChars =
      typeof uppercase === 'string'
        ? uppercase
        : uppercase
          ? this.DEFAULT_UPPERCASE
          : '';

    const lowercaseChars =
      typeof lowercase === 'string'
        ? lowercase
        : lowercase
          ? this.DEFAULT_LOWERCASE
          : '';

    const numberChars =
      typeof numbers === 'string'
        ? numbers
        : numbers
          ? this.DEFAULT_NUMBERS
          : '';

    const specialCharSet =
      typeof specialChars === 'string'
        ? specialChars
        : specialChars
          ? this.DEFAULT_SPECIAL_CHARS
          : '';

    // Combine character sets
    const allowedChars =
      uppercaseChars + lowercaseChars + numberChars + specialCharSet;

    // Validation
    if (allowedChars.length === 0) {
      throw new Error('At least one character type must be included');
    }

    if (length < 1) {
      throw new Error('Password length must be at least 1');
    }

    // Cryptographically secure random generation
    const crypto = globalThis.crypto || (globalThis as any).msCrypto;
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    // Generate password
    return Array.from(randomValues)
      .map(x => allowedChars[x % allowedChars.length])
      .join('');
  }

  /**
   * Generate a password with strong defaults
   * @param length Optional custom length
   */
  static strongPassword(length: number = 16): string {
    return this.generate({
      length,
      uppercase: true,
      lowercase: true,
      numbers: true,
      specialChars: true,
    });
  }

  /**
   * Generate a memorable password with words
   * @param wordCount Number of words to combine
   */
  static memorablePassword(wordCount: number = 3): string {
    const words = [
      'correct',
      'horse',
      'battery',
      'staple',
      'random',
      'phrase',
      'secure',
      'access',
      'unique',
      'strong',
      'password',
      'generate',
    ];

    // Randomly select words
    const selectedWords = Array.from(
      { length: wordCount },
      () => words[Math.floor(Math.random() * words.length)]
    );

    // Capitalize some words and add numbers
    const transformedWords = selectedWords.map((word, index) => {
      const capitalize = index % 2 === 0;
      const addNumber = index % 3 === 0;

      let transformedWord = capitalize
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word;

      return addNumber
        ? transformedWord + Math.floor(Math.random() * 10)
        : transformedWord;
    });

    return transformedWords.join('');
  }
}
