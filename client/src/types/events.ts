import type { ChangeEvent, FormEvent } from 'react';

export type FormSubmitHandler = (e: FormEvent<HTMLFormElement>) => void;
export type InputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => void;
export type SelectChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => void;
