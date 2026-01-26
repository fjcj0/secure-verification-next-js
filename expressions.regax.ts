export const emailRegax:RegExp = /^[a-z][a-z0-9_]+@[a-z]+\.[a-z]$/;
export const passwordRegax: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
export const nameRegax: RegExp = /^[a-z\u0621-\u064A]{3,}$/i;