import { verify } from "jsonwebtoken";

interface IPayload {
  user: string;
}

export async function ensureAuthenticated(
  token: any,
): Promise<IPayload> {

  if (!token) {
    throw new Error('Token missing');
  }

  try {
    const user =  verify(
      token,
      '7783698978206a7dab23a62285724408',
    ) as IPayload;
    
    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

