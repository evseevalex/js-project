import { TokensType } from "./tokens.type";
import { UserInfoType } from "./user-info.type";
import { OperationType } from "./operation.type";

type CustomResponseType = {
  error: boolean;
  response: Response | null;
  redirect?: string;
};

type DefaultResponseType = {
  error: boolean;
  message: string;
};

type TokensResponseType = {
  tokens: TokensType;
};

type BalanceResponseType = {
  balance: number;
};

type SignUpResponseType = {
  user: UserInfoType;
};

type AuthResponseType = {
  user: UserInfoType;
  tokens: TokensType;
};

type OperationsResponseType = OperationType[];

export {
  DefaultResponseType,
  TokensResponseType,
  BalanceResponseType,
  AuthResponseType,
  SignUpResponseType,
  OperationsResponseType,
  CustomResponseType,
};
