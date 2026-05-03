import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
type AllowedMediaType = typeof ALLOWED_MEDIA_TYPES[number]

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    // Rate limit: max 10 scans por usuário por hora
    const { allowed, msUntilReset } = checkRateLimit(`scan:${user.id}`, 10, 3_600_000)
    if (!allowed) {
      const minutes = Math.ceil(msUntilReset / 60_000)
      return NextResponse.json(
        { error: `Limite de escaneamentos atingido. Tente novamente em ${minutes} minuto(s).` },
        { status: 429 }
      )
    }

    // Receber imagem como base64
    const { imageBase64, mediaType } = await req.json()
    if (!imageBase64 || !mediaType) {
      return NextResponse.json({ error: 'Imagem não fornecida' }, { status: 400 })
    }

    // Validar mediaType em runtime
    if (!ALLOWED_MEDIA_TYPES.includes(mediaType as AllowedMediaType)) {
      return NextResponse.json({ error: 'Tipo de imagem não suportado.' }, { status: 400 })
    }

    // Limitar tamanho (5MB base64 ≈ ~3.7MB real)
    if (imageBase64.length > 7_000_000) {
      return NextResponse.json({ error: 'Imagem muito grande. Use uma foto menor.' }, { status: 400 })
    }

    // Chamar Claude Vision para extrair dados do comprovante
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analise este comprovante/nota fiscal/conta e extraia as informações.
Retorne APENAS um JSON válido com estes campos (sem markdown, sem explicações):
{
  "description": "descrição curta do que é (ex: Conta de Luz, Posto Ipiranga, Farmácia)",
  "amount": 0.00,
  "date": "YYYY-MM-DD",
  "type": "expense",
  "notes": "observação opcional (ex: referência, número do documento)"
}
Regras:
- description: máximo 60 caracteres, em português
- amount: valor total em reais (número decimal, sem símbolo)
- date: data do documento no formato YYYY-MM-DD (se não encontrar, use a data de hoje: ${new Date().toISOString().split('T')[0]})
- type: sempre "expense" para contas e compras
- notes: informação extra útil (vencimento, número do doc, etc.) ou string vazia`,
            },
          ],
        },
      ],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extrair JSON da resposta
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Não foi possível ler o comprovante. Tente uma foto mais nítida.' }, { status: 422 })
    }

    const extracted = JSON.parse(jsonMatch[0])

    // Validações básicas
    if (typeof extracted.amount !== 'number' || extracted.amount <= 0) {
      return NextResponse.json({ error: 'Valor não encontrado no comprovante.' }, { status: 422 })
    }

    return NextResponse.json({
      description: String(extracted.description ?? '').slice(0, 60),
      amount: Number(extracted.amount).toFixed(2),
      date: extracted.date ?? new Date().toISOString().split('T')[0],
      type: extracted.type ?? 'expense',
      notes: String(extracted.notes ?? '').slice(0, 200),
    })
  } catch (err) {
    console.error('scan-receipt error:', err)
    return NextResponse.json(
      { error: 'Erro ao processar imagem. Tente novamente.' },
      { status: 500 }
    )
  }
}
