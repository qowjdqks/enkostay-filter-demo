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

  if (input.action === 'analytics') {
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    await admin.from('activity_events').delete().lt('created_at', since)
    const maxEvents = input.userId ? 150 : 10000
    const rows: Array<{ id: number; user_id: string; event_type: string; payload: Record<string, unknown>; created_at: string }> = []
    while (rows.length < maxEvents) {
      const pageSize = Math.min(1000, maxEvents - rows.length)
      let query = admin.from('activity_events').select('id,user_id,event_type,payload,created_at').gte('created_at', since).order('created_at', { ascending: false }).order('id', { ascending: false }).range(rows.length, rows.length + pageSize - 1)
      if (input.userId) query = query.eq('user_id', input.userId)
      const { data: page, error } = await query
      if (error) return respond({ error: '활동 분석을 불러오지 못했습니다.' }, 500)
      rows.push(...(page ?? []))
      if (!page || page.length < pageSize) break
    }
    const byType: Record<string, number> = {}
    const categoryUsage: Record<string, number> = {}
    const optionUsage: Record<string, number> = {}
    const memberActivity: Record<string, { count: number; lastActivityAt: string }> = {}
    let zeroResults = 0
    let searchApplications = 0
    let resultTotal = 0
    let resultSamples = 0
    for (const event of rows) {
      byType[event.event_type] = (byType[event.event_type] ?? 0) + 1
      memberActivity[event.user_id] ??= { count: 0, lastActivityAt: event.created_at }
      memberActivity[event.user_id].count += 1
      if (event.event_type === 'search_applied') {
        searchApplications += 1
        const resultCount = Number(event.payload?.resultCount)
        if (Number.isFinite(resultCount)) {
          resultTotal += resultCount
          resultSamples += 1
          if (resultCount === 0) zeroResults += 1
        }
      }
      const category = event.payload?.category
      if (event.event_type === 'filter_opened' && typeof category === 'string') categoryUsage[category] = (categoryUsage[category] ?? 0) + 1
      const option = event.payload?.option
      if (typeof option === 'string' && event.payload?.selected === true) optionUsage[option] = (optionUsage[option] ?? 0) + 1
    }

    const { data: authData, error: authError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (authError) return respond({ error: '회원별 활동 정보를 불러오지 못했습니다.' }, 500)
    const members = authData.users.map((user) => ({
      id: user.id,
      email: user.email,
      activityCount: memberActivity[user.id]?.count ?? 0,
      lastActivityAt: memberActivity[user.id]?.lastActivityAt ?? null,
    })).sort((a, b) => b.activityCount - a.activityCount)

    return respond({
      since,
      truncated: !input.userId && rows.length === maxEvents,
      stats: {
        eventsTotal: rows.length,
        searchApplications,
        zeroResultRate: searchApplications ? zeroResults / searchApplications : 0,
        averageResults: resultSamples ? Math.round(resultTotal / resultSamples) : 0,
        byType,
        categoryUsage,
        optionUsage,
      },
      members,
      events: rows,
    })
  }

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
