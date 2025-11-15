import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import fs from 'fs'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'logs', 'abap-generation.log')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Verifica autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const type = searchParams.get('type') // 'memory' ou 'file'

    if (type === 'memory') {
      // Retorna logs em memória
      const logs = logger.getLogs()
      const limitedLogs = logs.slice(-limit)

      return NextResponse.json(
        {
          logs: limitedLogs,
          total: logs.length,
          returned: limitedLogs.length,
        },
        { status: 200 }
      )
    } else {
      // Retorna logs do arquivo
      try {
        if (!fs.existsSync(LOG_FILE)) {
          return NextResponse.json(
            {
              logs: [],
              message: 'Arquivo de log não existe ainda. Faça uma geração de código primeiro.',
            },
            { status: 200 }
          )
        }

        const logContent = fs.readFileSync(LOG_FILE, 'utf-8')
        const logLines = logContent.split('\n').filter(line => line.trim() !== '')

        // Pega últimas N linhas
        const limitedLines = logLines.slice(-limit)

        return NextResponse.json(
          {
            logs: limitedLines,
            total: logLines.length,
            returned: limitedLines.length,
            file_path: LOG_FILE,
          },
          { status: 200 }
        )
      } catch (error: any) {
        return NextResponse.json(
          {
            error: 'Erro ao ler arquivo de log',
            details: error.message,
          },
          { status: 500 }
        )
      }
    }
  } catch (error: any) {
    console.error('Erro ao buscar logs:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error?.message },
      { status: 500 }
    )
  }
}

// Endpoint para limpar logs
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Limpa arquivo de log
    logger.clearLogFile()

    return NextResponse.json(
      { success: true, message: 'Logs limpos com sucesso' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erro ao limpar logs:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error?.message },
      { status: 500 }
    )
  }
}
