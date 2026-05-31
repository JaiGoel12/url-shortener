import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/db';
import { generateShortCode } from '../utils/base62';
import { CacheService } from './cache.service';
import { AppError } from '../middleware/errorHandler';

interface CreateUrlInput {
  originalUrl: string;
  customAlias?: string;
  expiresAt?: string;
  userId: string;
}

interface UpdateUrlInput {
  isActive?: boolean;
  expiresAt?: string | null;
}

export class UrlService {
  static async createUrl(input: CreateUrlInput) {
    const { originalUrl, customAlias, expiresAt, userId } = input;

    if (customAlias) {
      const existing = await prisma.url.findUnique({
        where: { customAlias },
      });
      if (existing) {
        throw new AppError('Custom alias already in use', 409);
      }
    }

    const id = uuidv4();
    const shortCode = customAlias || generateShortCode(id);

    const existingCode = await prisma.url.findUnique({
      where: { shortCode },
    });
    if (existingCode) {
      throw new AppError('Short code collision. Please try again.', 409);
    }

    const url = await prisma.url.create({
      data: {
        id,
        originalUrl,
        shortCode,
        customAlias: customAlias || null,
        userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    await CacheService.setUrl(shortCode, {
      originalUrl: url.originalUrl,
      isActive: url.isActive,
      expiresAt: url.expiresAt?.toISOString() || null,
      urlId: url.id,
    });

    return url;
  }

  static async getUrlByShortCode(shortCode: string) {
    const cached = await CacheService.getUrl(shortCode);
    if (cached) {
      return cached;
    }

    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) return null;

    const cacheData = {
      originalUrl: url.originalUrl,
      isActive: url.isActive,
      expiresAt: url.expiresAt?.toISOString() || null,
      urlId: url.id,
    };

    await CacheService.setUrl(shortCode, cacheData);
    return cacheData;
  }

  static async getUserUrls(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      prisma.url.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.url.count({ where: { userId } }),
    ]);

    return {
      urls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUrlById(id: string, userId: string) {
    const url = await prisma.url.findFirst({
      where: { id, userId },
    });

    if (!url) {
      throw new AppError('URL not found', 404);
    }

    return url;
  }

  static async updateUrl(id: string, userId: string, input: UpdateUrlInput) {
    const url = await prisma.url.findFirst({
      where: { id, userId },
    });

    if (!url) {
      throw new AppError('URL not found', 404);
    }

    const updated = await prisma.url.update({
      where: { id },
      data: {
        isActive: input.isActive ?? url.isActive,
        expiresAt: input.expiresAt !== undefined
          ? (input.expiresAt ? new Date(input.expiresAt) : null)
          : url.expiresAt,
      },
    });

    await CacheService.invalidateUrl(url.shortCode);

    return updated;
  }

  static async deleteUrl(id: string, userId: string) {
    const url = await prisma.url.findFirst({
      where: { id, userId },
    });

    if (!url) {
      throw new AppError('URL not found', 404);
    }

    await prisma.url.update({
      where: { id },
      data: { isActive: false },
    });

    await CacheService.invalidateUrl(url.shortCode);

    return { message: 'URL deactivated successfully' };
  }

  static async incrementClickCount(urlId: string) {
    await prisma.url.update({
      where: { id: urlId },
      data: { clickCount: { increment: 1 } },
    });
  }
}
