import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UrlService } from '../services/url.service';
import { AppError } from '../middleware/errorHandler';

export async function createUrl(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    if (!originalUrl) {
      throw new AppError('originalUrl is required', 400);
    }

    try {
      new URL(originalUrl);
    } catch {
      throw new AppError('Invalid URL format', 400);
    }

    const url = await UrlService.createUrl({
      originalUrl,
      customAlias,
      expiresAt,
      userId: req.userId!,
    });

    res.status(201).json({
      success: true,
      data: {
        ...url,
        shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserUrls(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await UrlService.getUserUrls(req.userId!, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUrlById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const url = await UrlService.getUrlById(req.params.id, req.userId!);

    res.json({
      success: true,
      data: url,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUrl(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { isActive, expiresAt } = req.body;

    const url = await UrlService.updateUrl(req.params.id, req.userId!, {
      isActive,
      expiresAt,
    });

    res.json({
      success: true,
      data: url,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteUrl(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await UrlService.deleteUrl(req.params.id, req.userId!);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
