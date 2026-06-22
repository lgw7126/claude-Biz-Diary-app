import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const DAY_TYPE_LABELS: Record<string, string> = {
  weekday: "평일",
  weekend: "주말",
  holiday: "공휴일",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  if (!CLAUDE_API_KEY) {
    return new Response(
      JSON.stringify({ error: "CLAUDE_API_KEY secret is not set" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  try {
    const { today, history, businessType } = await req.json()

    const dayLabel = DAY_TYPE_LABELS[today.day_type] || today.day_type
    const w = today.weather
    const weatherStr = w
      ? `${w.description}(${w.temp}°C, 습도 ${w.humidity}%)`
      : "날씨 정보 없음"

    const historyText =
      history?.length > 0
        ? history
            .map((d: any) => {
              const dw = d.weather
              return (
                `${d.date}(${DAY_TYPE_LABELS[d.day_type] || d.day_type}): ` +
                `매출 ${Number(d.revenue).toLocaleString("ko-KR")}원` +
                (dw ? `, 날씨: ${dw.description} ${dw.temp}°C` : "") +
                (d.special_events?.length ? `, 특이사항: ${d.special_events.join("/")}` : "")
              )
            })
            .join("\n")
        : "이전 기록 없음"

    const prompt =
      `당신은 ${businessType || "자영업"} 사장님의 경영 분석 도우미입니다.\n\n` +
      `[오늘 영업 현황]\n` +
      `날짜: ${today.date} (${dayLabel})\n` +
      `매출: ${Number(today.revenue).toLocaleString("ko-KR")}원\n` +
      `날씨: ${weatherStr}\n` +
      `특이사항: ${today.special_events?.join(", ") || "없음"}\n` +
      `메모: ${today.notes || "없음"}\n\n` +
      `[최근 7일 기록]\n${historyText}\n\n` +
      `위 데이터를 분석해서 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:\n` +
      `{"comment":"오늘 장사에 대한 2~3문장 친근한 분석 (사장님 말투)","trend":"up 또는 down 또는 stable 중 하나","reason":"매출 증감의 핵심 이유 한 줄"}`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || "Claude API error")
    }

    const text = data.content[0].text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error("JSON not found in Claude response")
    }

    const analysis = JSON.parse(jsonMatch[0])

    if (!["up", "down", "stable"].includes(analysis.trend)) {
      analysis.trend = "stable"
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("Edge function error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
