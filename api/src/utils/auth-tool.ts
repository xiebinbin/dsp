import * as bcrypt from 'bcrypt';

export const passwordHash = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
