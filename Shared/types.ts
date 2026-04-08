export type SuccessResponse<T = void> = {
  success: true;
  message: string;
} & (T extends void ? {} : { data: T });

export type ErrorResponse<T = void> = {
  success: false;
  error: string;
  isFormError?: boolean;
} & (T extends void ? {} : { data: T });