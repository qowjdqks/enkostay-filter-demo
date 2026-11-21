import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return respond({ error: 'Method not allowed' }, 405)

  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const authorization = request.headers.get('Authorization')
  if (!url || !serviceKey || !authorization?.startsWith('Bearer ')) {
    return respond({ error: '로그인이 필요합니다.' }, 401)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const token = authorization.slice('Bearer '.length)
  const { data: authData, error: authError } = await admin.auth.getUser(token)
  if (authError || !authData.user) return respond({ error: '로그인이 만료되었습니다.' }, 401)

  const { data: membership, error: membershipError } = await admin
    .from('admin_users')
    .select('user_id')
    .eq('user_id', authData.user.id)
    .maybeSingle()
  let input: { action?: string; userId?: string }
  try {
    input = await request.json()
  } catch {
    return respond({ error: '요청 형식이 올바르지 않습니다.' }, 400)
  }

  if (input.action === 'check') return respond({ isAdmin: Boolean(membership) })
  if (membershipError || !membership) return respond({ error: '관리자 권한이 없습니다.' }, 403)

  if (input.action === 'list') {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (error) return respond({ error: '회원 목록을 불러오지 못했습니다.' }, 500)
    const users = data.users.map((user) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      banned_until: user.banned_until,
      confirmed: Boolean(user.email_confirmed_at),
    }))
    return respond({ users, total: users.length, suspended: users.filter((user) => user.banned_until && new Date(user.banned_until) > new Date()).length })
  }

  if (!['suspend', 'activate'].includes(input.action ?? '') || !input.userId) {
    return respond({ error: '요청 항목이 올바르지 않습니다.' }, 400)
  }
  if (input.userId === authData.user.id) return respond({ error: '현재 로그인한 관리자 계정은 여기서 정지할 수 없습니다.' }, 400)

  const { data: targetAdmin } = await admin.from('admin_users').select('user_id').eq('user_id', input.userId).maybeSingle()
  if (targetAdmin) return respond({ error: '관리자 계정은 회원 관리 화면에서 변경할 수 없습니다.' }, 400)

  const { error: updateError } = await admin.auth.admin.updateUserById(input.userId, {
    ban_duration: input.action === 'suspend' ? '876000h' : 'none',
  })
  if (updateError) return respond({ error: '회원 상태를 변경하지 못했습니다.' }, 500)
  return respond({ ok: true })
})
