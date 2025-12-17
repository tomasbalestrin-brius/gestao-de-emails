export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-key-change-this',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

export default jwtConfig;
