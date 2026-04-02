'use server'

import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from './prisma'

export async function registerUser(data: {
  name: string
  email: string
  password: string
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    return { error: 'Este e-mail já está cadastrado' }
  }

  const hashedPassword = await bcrypt.hash(data.password, 12)

  await prisma.user.create({
    data: {
      name: data.name || null,
      email: data.email,
      password: hashedPassword,
    },
  })

  return { success: true }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('authjs.session-token')
  cookieStore.delete('__Secure-authjs.session-token')
  redirect('/login')
}
