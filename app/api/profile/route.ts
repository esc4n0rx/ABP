import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

interface UpdateProfileRequest {
  name?: string
  phone?: string
  role?: string
  department?: string
  bio?: string
  avatar_url?: string
}

// GET - Buscar perfil do usuário logado
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Verifica autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Busca perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      // Se o perfil não existe, cria um básico
      if (profileError.code === "PGRST116") {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            name: user.email,
            role: "Consultor SAP",
          })
          .select()
          .single()

        if (insertError) {
          console.error("[PROFILE GET] Erro ao criar perfil:", insertError)
          return NextResponse.json(
            { success: false, error: "Erro ao criar perfil" },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: newProfile,
        })
      }

      console.error("[PROFILE GET] Erro ao buscar perfil:", profileError)
      return NextResponse.json(
        { success: false, error: "Erro ao buscar perfil" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error: any) {
    console.error("[PROFILE GET] Erro:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro ao buscar perfil",
      },
      { status: 500 }
    )
  }
}

// PUT/PATCH - Atualizar perfil do usuário logado
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Verifica autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body: UpdateProfileRequest = await request.json()

    // Validação básica
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum dado fornecido para atualização" },
        { status: 400 }
      )
    }

    // Campos permitidos para atualização
    const allowedFields = ["name", "phone", "role", "department", "bio", "avatar_url"]
    const updateData: Partial<UpdateProfileRequest> = {}

    // Filtra apenas campos permitidos
    Object.keys(body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key as keyof UpdateProfileRequest] = body[key as keyof UpdateProfileRequest]
      }
    })

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum campo válido fornecido" },
        { status: 400 }
      )
    }

    // Atualiza o perfil
    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("[PROFILE UPDATE] Erro ao atualizar:", updateError)
      return NextResponse.json(
        { success: false, error: "Erro ao atualizar perfil" },
        { status: 500 }
      )
    }

    console.log(`[PROFILE UPDATE] Perfil atualizado com sucesso para user ${user.id}`)

    return NextResponse.json({
      success: true,
      data: profile,
      message: "Perfil atualizado com sucesso",
    })
  } catch (error: any) {
    console.error("[PROFILE UPDATE] Erro:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro ao atualizar perfil",
      },
      { status: 500 }
    )
  }
}

// Alias para PATCH
export async function PUT(request: NextRequest) {
  return PATCH(request)
}
