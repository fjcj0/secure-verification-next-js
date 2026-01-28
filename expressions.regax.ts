export const emailRegex: RegExp = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
export const nameRegex: RegExp = /^(?:[a-z\u0621-\u064A]{3,})(?:\s[a-z\u0621-\u064A]{3,}){0,3}$/i;