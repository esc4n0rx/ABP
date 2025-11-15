import { NextRequest, NextResponse } from "next/server"
import { extractText } from "unpdf"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo foi enviado" },
        { status: 400 }
      )
    }

    // Validação de tipo de arquivo
    const fileName = file.name.toLowerCase()
    const isTxt = fileName.endsWith(".txt")
    const isPdf = fileName.endsWith(".pdf")

    if (!isTxt && !isPdf) {
      return NextResponse.json(
        { success: false, error: "Apenas arquivos TXT ou PDF são permitidos" },
        { status: 400 }
      )
    }

    // Validação de tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Arquivo muito grande. Tamanho máximo: 10MB" },
        { status: 400 }
      )
    }

    let text = ""

    try {
      if (isTxt) {
        // Processar arquivo TXT
        text = await file.text()
      } else if (isPdf) {
        // Processar arquivo PDF
        const arrayBuffer = await file.arrayBuffer()

        try {
          const result = await extractText(new Uint8Array(arrayBuffer))
          console.log("Resultado do unpdf:", typeof result, result)

          // unpdf pode retornar diferentes formatos, vamos lidar com todos
          if (typeof result === "string") {
            text = result
          } else if (result && typeof result === "object") {
            // Se retornar objeto com propriedade text
            if ("text" in result && typeof result.text === "string") {
              text = result.text
            }
            // Se retornar array de páginas
            else if (Array.isArray(result)) {
              text = result.join("\n")
            }
            // Se retornar objeto com pages
            else if ("pages" in result && Array.isArray(result.pages)) {
              text = result.pages.map((p: any) => p.text || "").join("\n")
            }
            // Tentar converter para string
            else {
              text = String(result)
            }
          } else {
            text = String(result)
          }
        } catch (pdfError: any) {
          console.error("Erro ao processar PDF:", pdfError)

          if (pdfError.message?.includes("password") || pdfError.message?.includes("encrypted")) {
            return NextResponse.json(
              { success: false, error: "Este PDF está protegido por senha e não pode ser lido" },
              { status: 400 }
            )
          }

          return NextResponse.json(
            {
              success: false,
              error: "Erro ao processar o PDF. Verifique se o arquivo está correto ou tente usar TXT"
            },
            { status: 400 }
          )
        }
      }

      // Garantir que text é uma string
      if (typeof text !== "string") {
        console.error("Texto não é string:", typeof text, text)
        text = String(text || "")
      }

      // Validação de conteúdo
      if (!text || text.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "O arquivo está vazio ou não contém texto válido" },
          { status: 400 }
        )
      }

      // Validação de tamanho mínimo
      if (text.trim().length < 50) {
        return NextResponse.json(
          { success: false, error: "O conteúdo do arquivo é muito curto. Mínimo: 50 caracteres" },
          { status: 400 }
        )
      }

      // Estatísticas do texto
      const cleanText = text.trim()
      const wordCount = cleanText.split(/\s+/).length
      const charCount = cleanText.length

      return NextResponse.json({
        success: true,
        data: {
          text: cleanText,
          fileName: file.name,
          fileSize: file.size,
          wordCount,
          charCount,
        },
      })
    } catch (processingError: any) {
      console.error("Erro ao processar arquivo:", processingError)
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao processar o arquivo: ${processingError.message || "Erro desconhecido"}`
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Erro na API de upload:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro ao processar requisição"
      },
      { status: 500 }
    )
  }
}
