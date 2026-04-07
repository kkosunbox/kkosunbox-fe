/** 백엔드 공통 성공 응답 envelope */
export interface ApiResponse<T> {
  result: true;
  data: T;
}

/** 백엔드 공통 에러 응답 envelope */
export interface ApiErrorResponse {
  result: false;
  code: string;
  message: string;
  traceId: string;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    /** 백엔드 에러 코드 (예: "UNAUTHORIZED", "ALREADY_EXISTS") */
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() {
    return this.statusCode === 401;
  }

  get isForbidden() {
    return this.statusCode === 403;
  }

  get isNotFound() {
    return this.statusCode === 404;
  }

  get isConflict() {
    return this.statusCode === 409;
  }
}
