const INVALID_NUMERIC_CHARS = ['-', '+', 'e']

export const isInvalidNumber = (key: string) => INVALID_NUMERIC_CHARS.includes(key)
