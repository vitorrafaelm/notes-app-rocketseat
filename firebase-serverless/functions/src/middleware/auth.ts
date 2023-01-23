import { verify } from "jsonwebtoken";

interface IPayload {
  user: {
    id: string;
  };
}

export async function ensureAuthenticated(
  request: any,
) {

  const token = request.headers.authorization;

  if (!token) {
    throw new Error('Token missing');
  }

  try {
    verify(
      token,
      '7783698978206a7dab23a62285724408',
    ) as IPayload;
    
    return true;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

