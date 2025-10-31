import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = (body?.name ?? '').toString().trim()
    const quantity = body?.quantity ? body.quantity.toString() : ''

    if (!name) {
      return NextResponse.json({ error: 'Ingredient name is required' }, { status: 400 })
    }

    // Check if ingredient already exists (case-insensitive)
    const existing = await prisma.ingredient.findFirst({
      where: { ingredientName: { equals: name, mode: 'insensitive' } },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ingredient already exists', id: existing.ingredientId },
        { status: 409 }
      )
    }

    // Create ingredient
    const newIngredient = await prisma.ingredient.create({
      data: { ingredientName: name },
    })

    return NextResponse.json(
      { id: newIngredient.ingredientId, name: newIngredient.ingredientName, quantity },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/ingredients error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { ingredientName: 'asc' },
    })
    return NextResponse.json(ingredients, { status: 200 })
  } catch (err) {
    console.error('GET /api/ingredients error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
