import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { jwtConfig } from '../../config/jwt';
import { JwtPayload } from '../../types';
import { LoginDTO, RegisterDTO } from './dto';

export class AuthService {
  async login(data: LoginDTO) {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    if (!user.is_active) {
      throw new Error('Usuário inativo');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Email ou senha inválidos');
    }

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // Gerar token JWT
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(data: RegisterDTO) {
    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Hash da senha
    const password_hash = await bcrypt.hash(data.password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password_hash,
        name: data.name,
        role: data.role || 'AGENT',
      },
    });

    // Gerar token JWT
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
        last_login_at: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (!user.is_active) {
      throw new Error('Usuário inativo');
    }

    return user;
  }
}

export default new AuthService();
