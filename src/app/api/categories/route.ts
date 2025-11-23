/**
 * @file Categories API Route (GET/POST /api/categories)
 *
 * @description
 * Provides CRUD functionality for recipe categories (Create + Read).
 * This route allows creating new categories with case-insensitive uniqueness
 * checks and fetching all existing categories sorted alphabetically.
 *
 * @returns
 * - POST: JSON response with the created category or validation errors
 * - GET: List of all categories in ascending alphabetical order
 *
 * @dependencies
 * - Prisma: Category creation and retrieval
 * - NextResponse: Standard JSON responses for Next.js API routes
 */

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = (body?.name ?? '').toString().trim()

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    // Check if category already exists (case-insensitive)
    const existing = await prisma.category.findFirst({
      where: { categoryName: { equals: name, mode: 'insensitive' } },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists', id: existing.categoryId },
        { status: 409 }
      )
    }

    // Create new category
    const newCategory = await prisma.category.create({
      data: { categoryName: name },
    })

    return NextResponse.json(
      { id: newCategory.categoryId, name: newCategory.categoryName },
      { status: 201 }
    )
  } catch (e) {
    console.error('POST /api/categories error:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { categoryName: 'asc' },
    })
    return NextResponse.json(categories, { status: 200 })
  } catch (e) {
    console.error('GET /api/categories error:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

